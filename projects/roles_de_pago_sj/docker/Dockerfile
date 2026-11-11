FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG BASE_HREF=/
RUN pnpm build:libs && pnpm ng build roles_de_pago_sj --configuration=production --base-href=$BASE_HREF

FROM nginx:1.27-alpine AS runtime
COPY --from=builder /app/projects/roles_de_pago_sj/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/roles_de_pago_sj/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
