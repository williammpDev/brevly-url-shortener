FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/package.json
RUN npm ci --workspace=server
COPY server server
RUN npm run build --workspace=server

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/server/package.json server/package.json
COPY --from=build /app/server/dist server/dist
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/server/node_modules server/node_modules
EXPOSE 3333
CMD ["node", "server/dist/server.js"]
