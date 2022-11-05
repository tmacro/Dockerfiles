FROM alpine:latest

ENV PARALLEL_DOWNLOADS 5
ENV RPC_SECRET insecure
ENV RPC_PORT 6800
ENV DOWNLOAD_DIR /data

RUN apk add --update --no-cache aria2 rclone

ADD ./entrypoint.sh /

ENTRYPOINT [ "/entrypoint.sh" ]
