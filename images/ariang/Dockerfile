FROM nginx:alpine

ENV ARIANG_VERSION 1.2.5

WORKDIR /usr/share/nginx/html

RUN curl -L -o ariang.zip https://github.com/mayswind/AriaNg/releases/download/${ARIANG_VERSION}/AriaNg-${ARIANG_VERSION}.zip && \
    unzip -o ariang.zip && \
    rm ariang.zip
