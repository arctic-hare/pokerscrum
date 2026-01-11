FROM node:22-bookworm

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Передаем переменные окружения на этапе сборки для Nuxt (ДО копирования кода)
# Это гарантирует, что изменения переменных инвалидируют кеш сборки
ARG API_BASE
ARG WS_BASE
ARG NUXT_PUBLIC_API_BASE
ARG NUXT_PUBLIC_WS_BASE
ENV API_BASE=${API_BASE}
ENV WS_BASE=${WS_BASE}
ENV NUXT_PUBLIC_API_BASE=${NUXT_PUBLIC_API_BASE:-${API_BASE}}
ENV NUXT_PUBLIC_WS_BASE=${NUXT_PUBLIC_WS_BASE:-${WS_BASE}}

COPY . .

RUN npm run build

EXPOSE 3001
ENV PORT=3001
ENV NITRO_PORT=3001
CMD ["node", ".output/server/index.mjs"]
