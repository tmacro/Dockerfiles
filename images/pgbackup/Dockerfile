FROM alpine:latest

RUN apk add --no-cache postgresql rclone tar gzip\
    && adduser -D pgbackup

ADD rclone.conf /home/pgbackup/.config/rclone/rclone.conf

ADD pg_backup.sh /home/pgbackup/

RUN chmod +x /home/pgbackup/pg_backup.sh \
    && chown -R pgbackup:pgbackup /home/pgbackup/

WORKDIR /home/pgbackup

USER pgbackup

CMD ./pg_backup.sh
