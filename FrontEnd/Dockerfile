FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Install serve for static files
RUN npm install -g serve

EXPOSE 5173

CMD ["serve", "-s", "build", "-l", "5173"]