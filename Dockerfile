# Stage 1: install dependencies
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: build
FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage 3: production image
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
# (opcional) COPY package*.json ./
EXPOSE 3000
ENV PORT=3000
CMD ["node", "dist/index.js"]

## Como correrlo localmente, primero construir la imagen
# docker build . -t test-api
## Luego correr el contenedor y pasar el .env si es necesario
# docker run --network=products_ts_net --env-file .env-docker -p 3000:3000 test-api
# Nota: --network=products_ts_net es para que el contenedor pueda ver a los demas contenedores del docker-compose
#