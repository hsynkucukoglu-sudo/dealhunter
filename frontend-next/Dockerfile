FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]

# Build cache buster 2026-05-25-v1
