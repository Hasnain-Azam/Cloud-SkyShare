# Dev-friendly image (includes dev deps like nodemon)
FROM node:20-alpine

WORKDIR /app

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy source
COPY src ./src

# Expose API port
EXPOSE 4000

# Default to production start; docker-compose will override to "npm run dev"
CMD ["npm", "run", "start"]
