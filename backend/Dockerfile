
FROM node:18
WORKDIR /app
COPY package*.json ./
COPY . .
RUN yarn install
RUN yarn copy-resources
RUN npm install typescript
# RUN yarn add typescript
RUN yarn run build
EXPOSE 3001
ENTRYPOINT ["node", "out/nodeEntrypoint.js"]
