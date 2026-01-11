FROM node:22-bookworm

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Создаем entrypoint скрипт для запуска миграций перед стартом
RUN echo '#!/bin/sh\nset -e\nnpx prisma migrate deploy\nnode dist/main.js' > /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

CMD ["/app/docker-entrypoint.sh"]
