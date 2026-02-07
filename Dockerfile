FROM node:12

WORKDIR /app

COPY ./Server/setup.js ./Server/
COPY ./Server/package*.json ./Server/
COPY ./Server/lib/package*.json ./Server/lib/
COPY ./Server/lib/ ./Server/lib/
COPY ./Server/lib/sub/ ./Server/lib/sub/


RUN cd Server && npm install
RUN cd Server && node setup

RUN cd Server/lib && npm install
RUN cd Server/lib && npx grunt default pack

WORKDIR /kkutu
