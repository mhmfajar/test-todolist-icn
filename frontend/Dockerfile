FROM oven/bun:latest AS dev
WORKDIR /app
COPY package.json bun.lockb* bun.lock* ./
RUN bun install --frozen-lockfile
EXPOSE 3000
CMD ["bun", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3000"]
