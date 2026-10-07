ARG RELEASE_NODE=26.10.0
ARG BASE_OCI_IMAGE=node:${RELEASE_NODE}-alpine

FROM ${BASE_OCI_IMAGE} AS base
WORKDIR /srv/app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /srv/app/node_modules ./node_modules
COPY package*.json tsconfig*.json webpack.config.cjs ./
COPY server ./server
COPY src ./src
COPY templates ./templates
COPY public ./public
ARG RELEASE_APP=0
ENV RELEASE_APP=$RELEASE_APP
RUN npm run build

FROM base AS prod-deps
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM base AS runtime
RUN apk add --no-cache tini
USER node
ENV NODE_ENV=production
COPY --chown=node:node --from=prod-deps /srv/app/node_modules ./node_modules
COPY --chown=node:node --from=build /srv/app/dist ./dist
COPY --chown=node:node --from=build /srv/app/public ./public

ENTRYPOINT ["tini", "--"]
CMD ["node", "dist/Server.js"]
