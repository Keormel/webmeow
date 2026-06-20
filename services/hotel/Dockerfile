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

RUN chmod +x entrypoint.sh

EXPOSE 3000

CMD ["./entrypoint.sh"]