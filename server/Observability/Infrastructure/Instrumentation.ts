import { type Span } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  ATTR_CLIENT_ADDRESS,
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_HTTP_ROUTE,
  ATTR_NETWORK_PROTOCOL_VERSION,
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_URL_FULL,
  ATTR_URL_PATH,
  ATTR_URL_SCHEME,
  ATTR_USER_AGENT_ORIGINAL,
} from '@opentelemetry/semantic-conventions';
import type { Request, Response } from 'express';

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

export const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME ?? 'xver/airplanegame',
    [ATTR_SERVICE_VERSION]: process.env.RELEASE_APP ?? 'DEV',
  }),
  ...(otlpEndpoint
    ? {
        traceExporter: new OTLPTraceExporter({
          url: `${otlpEndpoint}/v1/traces`,
          headers: {},
        }),
      }
    : {}),
});

export function setSpanAttributes(
  span: Span,
  req: Request,
  res: Response,
  route: string,
): void {
  span.updateName(`${req.method} ${route}`);
  span.setAttribute(ATTR_HTTP_ROUTE, `${req.method} ${route}`);
  if (req.ip) {
    span.setAttribute(ATTR_CLIENT_ADDRESS, req.ip);
  }
  span.setAttribute(ATTR_HTTP_REQUEST_METHOD, req.method);
  span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, res.statusCode);
  span.setAttribute(ATTR_NETWORK_PROTOCOL_VERSION, req.httpVersion);
  span.setAttribute(
    ATTR_URL_FULL,
    `${req.protocol}://${req.host}${req.originalUrl}`,
  );
  span.setAttribute(ATTR_URL_PATH, req.path);
  span.setAttribute(ATTR_URL_SCHEME, req.protocol);
  const userAgent = req.get('User-Agent');
  if (userAgent) {
    span.setAttribute(ATTR_USER_AGENT_ORIGINAL, userAgent);
  }
}
