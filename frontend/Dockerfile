# TanStack Start app: build once, run the Nitro server (no node_modules needed at runtime).
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app
COPY --from=build /app/.output ./.output
# prompts.json and cringe.json are mounted here by compose (shared with mcp_server.py).
ENV PORT=3000 ILMJ_ROOT=/data
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
