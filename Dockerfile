ARG NODE_VERSION=24.14.1
ARG NPM_VERSION=11.11.0

FROM node:${NODE_VERSION}-alpine AS base

ARG NPM_VERSION
WORKDIR /app

RUN npm install -g npm@${NPM_VERSION}

FROM base AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS production

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
