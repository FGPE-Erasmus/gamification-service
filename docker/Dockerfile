FROM node:14-alpine

RUN apk update && apk add bash

RUN mkdir -p /home/node/app/node_modules
RUN mkdir -p /home/node/.npm-global

ARG PORT=3000
ARG NODE_ENV='dev'

ENV NODE_ENV=$NODE_ENV
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

WORKDIR /home/node/app

COPY package*.json ./
COPY .npmrc ./

RUN npm install

RUN chown -R node:node /home/node/.npm-global

COPY .env.$NODE_ENV ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN chown -R node:node /home/node/app

USER node

EXPOSE $PORT

CMD [ "npm", "run", "start:dev" ]
