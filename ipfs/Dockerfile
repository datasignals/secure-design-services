FROM node:20
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install
RUN node server
CMD ["node", "build/server.js"]
