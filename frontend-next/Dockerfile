FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build && echo "google.com, pub-4113343151276849, DIRECT, f08c47fec0942fa0" > /app/public/ads.txt

EXPOSE 3000

CMD ["npm", "run", "start"]

# Build cache buster 2026-07-26-v6
# Reden: de build van a7184ff (merk noindex) faalde op Railway in "Build image"
# terwijl `tsc --noEmit` en `next build` lokaal schoon draaien, en Railway voor
# die deployment geen build logs bewaarde. Zonder logs is de meest waarschijnlijke
# verklaring een kapotte/verouderde Docker-laag of een tijdelijke npm-fout; deze
# bump forceert een volledig verse build. Blijft het falen, dan is het geen cache.
