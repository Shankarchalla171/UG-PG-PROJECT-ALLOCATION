# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy from builder - use 'dist' instead of 'build'
COPY --from=builder /app/dist ./dist

# Install serve for static files
RUN npm install -g serve

EXPOSE 5173

# Serve from dist directory
CMD ["serve", "-s", "dist", "-l", "5173"]