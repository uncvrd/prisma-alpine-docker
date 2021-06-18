# ------------> Base Image
FROM node:14-alpine AS base

WORKDIR /workspace

# ------------> Development Image
FROM base AS development

COPY package*.json ./
COPY prisma ./prisma

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]

# ------------> Production Image
FROM base AS production

# USER node

COPY package*.json ./
COPY prisma ./prisma
# COPY --chown=node:node package*.json ./
# COPY --chown=node:node prisma ./prisma

RUN npm ci

COPY . .

RUN npm run build

RUN npm prune --production

CMD ["npm", "run", "start"]