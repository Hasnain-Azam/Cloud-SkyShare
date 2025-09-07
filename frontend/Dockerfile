# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install devDependencies too (Tailwind/PostCSS live in dev deps)
ENV NODE_ENV=development

# Set API URL at build time (fallback to http://localhost:4000)
ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=${VITE_API_URL}

# Install deps and build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Runtime stage (Nginx) ---
FROM nginx:alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
