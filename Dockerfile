FROM node:slim
MAINTAINER Lance Hudson <lance@lancehudson.com>

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ADD package.json /usr/src/app/
RUN npm install
ADD . /usr/src/app

EXPOSE 4000
CMD [ "npm", "start" ]
