FROM node:18-alpine AS builder
WORKDIR /app

# install dependencies
COPY package.json package-lock.json* ./
# Use `npm ci` when a lockfile exists, otherwise fall back to `npm install`
RUN if [ -f package-lock.json ]; then npm ci --silent; else npm install --silent; fi

# copy source
COPY . .

# Set Vite build-time environment variables from build args
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# build
RUN npm run build

FROM nginx:stable-alpine
# install envsubst (gettext) so we can substitute $PORT in the nginx template at runtime
RUN apk add --no-cache gettext
COPY --from=builder /app/dist /usr/share/nginx/html

# Use nginx.conf as a template; the entrypoint will substitute $PORT
RUN rm /etc/nginx/conf.d/default.conf || true
COPY nginx.conf /etc/nginx/conf.d/nginx.conf
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
