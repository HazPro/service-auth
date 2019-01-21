FROM node:8-alpine

ADD ./ /usr/source

RUN cd /usr/source \
    && yarn && yarn build \
    && mkdir -p /usr/app \
    && mkdir -p /usr/app/assets/keys \
    && mkdir -p /usr/app/assets/cert \
    && cp -R ./build/* /usr/app \
    && cp package.json /usr/app \
    && cd /usr/app && yarn install --prod \
    && rm -rf /usr/source

VOLUME [ "/usr/app/asstes" ]

WORKDIR /usr/app

ENTRYPOINT [ "node", "index.js" ]