FROM node:7

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

ADD . /usr/src/app/
RUN npm run build

EXPOSE 3000
CMD [ "node", "out/index.js" ]