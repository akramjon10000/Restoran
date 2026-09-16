FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY server.js ./
COPY dist ./dist

EXPOSE 80

ENV PORT=80
ENV NODE_ENV=production

CMD ["node", "server.js"]
