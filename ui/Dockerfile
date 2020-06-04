# build environment
FROM node:13.12.0-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent
RUN npm install react-scripts@3.4.1 -g --silent
COPY . ./
RUN npm run build

# production environment
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY env2js.sh ./
RUN ["chmod", "+x", "./env2js.sh"]
EXPOSE 80
CMD sh -c './env2js.sh > /usr/share/nginx/html/config.js && nginx -g "daemon off;"'