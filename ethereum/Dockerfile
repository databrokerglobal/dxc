FROM node:12-alpine

RUN apk --update add --no-cache --virtual build-dependencies bash python git make g++ jq zip curl

ARG NPM_TOKEN
ENV NPM_TOKEN=$NPM_TOKEN

RUN mkdir -p /srv
WORKDIR /srv

RUN echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > .npmrc

COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

ENV PATH /srv/node_modules/.bin:$PATH

COPY . .

RUN npm run compile
