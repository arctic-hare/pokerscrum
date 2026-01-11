FROM node:22-bookworm

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3001
ENV PORT=3001
ENV NITRO_PORT=3001
CMD ["node", ".output/server/index.mjs"]
