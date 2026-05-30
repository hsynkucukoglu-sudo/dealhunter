FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build && echo "google.com, pub-6266103134639533, DIRECT, f08c47fec0942fa0" > /app/public/ads.txt

EXPOSE 3000

CMD ["npm", "run", "start"]

# Build cache buster 2026-05-30-v2
