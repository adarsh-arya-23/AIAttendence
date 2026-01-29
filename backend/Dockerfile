# Production-optimized Dockerfile
FROM node:22-bullseye

# Install build tools for better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

# Create directories and set permissions
RUN mkdir -p uploads/images uploads/photos logs && \
    chmod -R 777 uploads logs

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "src/server.js"]
