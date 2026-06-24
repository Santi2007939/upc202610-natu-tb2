# ====== Fase 1: Build ======
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Construimos la SPA para producción
RUN npm run build

# ====== Fase 2: Servidor Nginx ======
FROM nginx:alpine AS production-stage
# Copiamos la plantilla de Nginx para inyectar variables de entorno (Reverse Proxy)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
# Copiamos el build generado en la fase anterior
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
