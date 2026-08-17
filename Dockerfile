# syntax=docker/dockerfile:1




FROM node:26.3-alpine3.22 AS builder
WORKDIR /app




COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund --ignore-scripts

COPY . .













ARG VITE_API_URL=/api
ARG VITE_CHATBOT_WEBHOOK_URL=/webhook/chatbot/message
ARG VITE_VAPID_PUBLIC_KEY=""
ARG SITE_URL=http://localhost:3000
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_CHATBOT_WEBHOOK_URL=${VITE_CHATBOT_WEBHOOK_URL} \
    VITE_VAPID_PUBLIC_KEY=${VITE_VAPID_PUBLIC_KEY} \
    SITE_URL=${SITE_URL} \
    NODE_ENV=production

RUN npm run build








FROM nginxinc/nginx-unprivileged:1.27-alpine3.21-slim AS runtime



USER root



RUN apk update && apk upgrade --no-cache
RUN rm -f /etc/nginx/conf.d/default.conf
COPY docker/default.conf.template /etc/nginx/default.conf.template
COPY docker/docker-entrypoint.sh /docker-entrypoint.d/40-render-nginx-config.sh
RUN chmod +x /docker-entrypoint.d/40-render-nginx-config.sh
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html
USER nginx







ENV BACKEND_UPSTREAM=http://localhost:4000 \
    CHATBOT_UPSTREAM=http://localhost:5678

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --spider http://127.0.0.1:8080/ || exit 1




