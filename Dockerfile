FROM node:18-alpine AS builder
WORKDIR /app

# install dependencies
COPY package.json package-lock.json* ./
# Use `npm ci` when a lockfile exists, otherwise fall back to `npm install`
RUN if [ -f package-lock.json ]; then npm ci --silent; else npm install --silent; fi

# copy source and build
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA fallback
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
