FROM node:22-bookworm

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Создаем entrypoint скрипт для синхронизации схемы базы данных перед стартом
RUN echo '#!/bin/sh\nset -e\necho "Pushing database schema..."\nnpx prisma db push --accept-data-loss --skip-generate || echo "Schema push failed, continuing anyway..."\necho "Starting application..."\nnode dist/main.js' > /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

CMD ["/app/docker-entrypoint.sh"]
