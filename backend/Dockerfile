FROM node:22-bullseye

# Install build tools for better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Ensure upload directories exist in the container
RUN mkdir -p uploads/images uploads/photos

EXPOSE 5000

CMD ["npm", "run", "dev"]
