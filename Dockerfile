# Base image
FROM node:20-alpine as base
WORKDIR /app
COPY package*.json ./

# Build phase
FROM base as build
RUN npm ci
COPY . .
RUN npm run build

# Production phase
FROM caddy:2-alpine
# Copier le Caddyfile à l'emplacement standard de configuration de Caddy
COPY Caddyfile /etc/caddy/Caddyfile
# Copier les fichiers de build
COPY --from=build /app/dist /usr/share/caddy
