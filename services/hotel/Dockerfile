FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.18.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm exec prisma generate
RUN pnpm run build

FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@10.18.0 --activate

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/prisma/seed.js && exec node dist/src/main.js"]