FROM oven/bun:latest AS dev
WORKDIR /app

COPY package.json bun.lockb* bun.lock* ./
RUN bun install --frozen-lockfile

CMD ["bun", "run", "dev"]
