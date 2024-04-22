FROM node:20 as builder
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install
RUN npm run build
CMD ["node", "build/api/index.js"]