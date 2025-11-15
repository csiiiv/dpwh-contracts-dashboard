## Build stage
# Use Node 20 (LTS) for improved ESM support and compatibility with newer packages
FROM node:20-alpine AS build
LABEL org.opencontainers.image.source="https://github.com/bettergov/dpwh-contracts-dashboard"
LABEL org.opencontainers.image.licenses="MIT"
LABEL maintainer="dpwh-team@bettergov.ph"

# Install deps and build app in a dedicated build stage. This stage is
# optimized for Docker layer caching: we copy only package files first so
# dependencies are re-used when source files change.
WORKDIR /app

# Copy package manifests. If a lockfile exists it'll be used by npm ci.
COPY package.json package-lock.json* ./

# Prefer npm ci when a lockfile is present for reproducible installs.
# Ensure devDependencies are installed during the build stage so build tools
# like `vite` (installed as a devDependency) are available. Do not set
# NODE_ENV=production here because npm will omit devDependencies when that
# env var is set.
ARG NODE_ENV=production
# Use development for the install/build step so devDependencies are installed.
ENV NODE_ENV=development

RUN if [ -f package-lock.json ]; then \
			npm ci --silent --no-audit --progress=false && npm cache clean --force; \
		else \
			npm install --silent --no-audit --progress=false && npm cache clean --force; \
		fi

# Copy only source files after dependencies installed to maximize cache hits
# for the dependency layer.
COPY . .

# Accept build-time environment variables for Vite. These are baked into the
# built assets at build time.
ARG VITE_API_URL
ARG VITE_BASE_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_BASE_URL=${VITE_BASE_URL}

# Build production assets
RUN npm run build --silent

### Production image: small, immutable nginx to serve built assets
FROM nginx:1.27-alpine AS runtime

# Copy built files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Replace default nginx config to support SPA routing and caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port and provide a lightweight healthcheck
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
	CMD test -s /usr/share/nginx/html/index.html || exit 1

CMD ["nginx", "-g", "daemon off;"]
