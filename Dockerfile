FROM node:22-slim

# API-only: skip Chromium/Firefox/WebKit download (~600MB saved)
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

WORKDIR /app

# Layer caching: lockfile first, install, then copy source
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD ["npx", "playwright", "test"]
