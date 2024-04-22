FROM node:16

WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . ./

RUN yarn add react-scripts
RUN yarn run build

EXPOSE 3002

ENTRYPOINT ["yarn", "run", "deploy"]