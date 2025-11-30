FROM node:22-slim AS base

WORKDIR /qqmonitor_api

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY . .

CMD ["node", "src/main.js"]
