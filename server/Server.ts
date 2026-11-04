import {
  sdk,
  setSpanAttributes,
} from './Observability/Infrastructure/Instrumentation.js';
import { SpanKind, SpanStatusCode, trace, type Span } from '@opentelemetry/api';
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import http, { type Server } from 'http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

sdk.start();

const tracer = trace.getTracer(
  process.env.OTEL_SERVICE_NAME ?? 'xver-airplanegame-dev',
  process.env.RELEASE_APP ?? 'DEV',
);
const port = Number.parseInt(process.env.NODE_PORT ?? '3000', 10);
const shutdownGraceMs = Number.parseInt(
  process.env.SHUTDOWN_GRACE_MS ?? '25000',
  10,
);
const app: Express = express();
const activeRequests = new Set<http.IncomingMessage>();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const documentRoot = path.resolve(__dirname, '..', 'public');

let isReady = true;
let isShuttingDown = false;
let shutdownTimer: NodeJS.Timeout | undefined;

app.disable('x-powered-by');

app.set('trust proxy', true);

app.use(trackInflightRequests);
app.use('/img', express.static(path.join(documentRoot, 'img')));
app.use('/css', express.static(path.join(documentRoot, 'css')));
app.use('/js', express.static(path.join(documentRoot, 'js')));

app.get('/', (req, res) => {
  runInSpan(req, res, 'game', (span) => {
    sendFile(res, 'index.html');
    span.setStatus({ code: SpanStatusCode.OK });
  });
});

app.get('/live', (req, res) => {
  runInSpan(req, res, 'live', (span) => {
    setNoCacheHeaders(res);
    setHeaders(res);
    res.status(200).send('OK');
    span.setStatus({ code: SpanStatusCode.OK });
  });
});

app.get('/ready', (req, res) => {
  runInSpan(req, res, 'ready', (span) => {
    setNoCacheHeaders(res);
    setHeaders(res);
    if (!isReady || isShuttingDown) {
      res.status(503).send('NOT_READY');
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: 'Server is draining',
      });
      return;
    }

    res.status(200).send('OK');
    span.setStatus({ code: SpanStatusCode.OK });
  });
});

app.use((req, res, _next) => {
  void _next;
  res.status(404);
  runInSpan(req, res, 'page-not-found', (span) => {
    sendFile(res, 'error.html');
    span.setStatus({ code: SpanStatusCode.OK });
  });
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  void _next;
  console.error(err.stack);
  res.status(500);
  runInSpan(req, res, 'error', (span) => {
    sendFile(res, 'error.html');
    span.recordException(err);
    span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
  });
});

const server = app.listen(port, () => {
  logLifecycleEvent('server_listening', { port });
});

server.keepAliveTimeout = 5000;
server.headersTimeout = 6000;
bindShutdownSignals(server);

function runInSpan(
  req: Request,
  res: Response,
  route: string,
  fn: (span: Span) => void,
): void {
  try {
    tracer.startActiveSpan(route, { kind: SpanKind.SERVER }, (span: Span) => {
      setSpanAttributes(span, req, res, route);
      fn(span);
      span.end();
    });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).send('Internal Server Error');
    }
  }
}

function trackInflightRequests(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  activeRequests.add(req);
  req.on('close', () => {
    activeRequests.delete(req);
  });
  next();
}

function sendFile(res: Response, file: string): void {
  setHeaders(res);
  res.sendFile(file, {
    root: documentRoot,
    dotfiles: 'deny',
  });
}

function setHeaders(res: Response): void {
  if (isShuttingDown) {
    res.setHeader('Connection', 'close');
  }
}

function setNoCacheHeaders(res: Response): void {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

function bindShutdownSignals(serverInstance: Server): void {
  const shutdown = (signal: NodeJS.Signals) => {
    if (isShuttingDown) {
      return;
    }

    logLifecycleEvent('shutdown_started', {
      signal,
      activeRequests: activeRequests.size,
      shutdownGraceMs,
    });
    isReady = false;
    isShuttingDown = true;
    logLifecycleEvent('readiness_changed', { state: 'draining' });

    serverInstance.close((error?: Error) => {
      if (shutdownTimer) {
        clearTimeout(shutdownTimer);
      }

      if (error) {
        console.error(
          JSON.stringify({
            event: 'server_close_failed',
            error: error.message,
          }),
        );
        process.exitCode = 1;
      } else {
        logLifecycleEvent('server_closed');
      }

      void sdk
        .shutdown()
        .catch((sdkError) => {
          console.error(
            JSON.stringify({
              event: 'telemetry_shutdown_failed',
              error:
                sdkError instanceof Error ? sdkError.message : String(sdkError),
            }),
          );
          process.exitCode = 1;
        })
        .finally(() => {
          process.exit();
        });
    });

    serverInstance.closeIdleConnections();

    for (const request of activeRequests) {
      request.socket.setKeepAlive(false);
    }

    shutdownTimer = setTimeout(() => {
      console.error(
        JSON.stringify({
          event: 'shutdown_forced',
          timeoutMs: shutdownGraceMs,
          activeRequests: activeRequests.size,
        }),
      );
      process.exit(1);
    }, shutdownGraceMs);

    shutdownTimer.unref();
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

function logLifecycleEvent(
  event: string,
  details: Record<string, string | number> = {},
): void {
  console.log(
    JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      ...details,
    }),
  );
}
