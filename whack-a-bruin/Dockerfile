FROM node:alpine3.20

WORKDIR /usr/src/app

COPY ./build ./build

COPY ./package.json package.json

RUN npm i

EXPOSE 3000

CMD ["npx", "serve", "-s", "build", "-l", "3000"]
