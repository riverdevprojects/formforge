FROM node:20-bookworm AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

FROM node:20-bookworm AS backend-deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev

FROM node:20-bookworm-slim
ENV NODE_ENV=production DB_PATH=/data/db/smartforms.db UPLOAD_DIR=/data/uploads
WORKDIR /app/backend
COPY backend/ ./
COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY shared/ /app/shared/
COPY --from=frontend /app/frontend/dist /app/frontend/dist
RUN mkdir -p /data/db /data/uploads && chown -R node:node /data
USER node
VOLUME ["/data"]
EXPOSE 3001
CMD ["node", "server.js"]
