#!/bin/sh

set -ex

if [ -z "$S3_BUCKET" ]; then
    echo '$S3_BUCKET must be set'
    exit 1
fi

if [ -z "$RCLONE_S3_ENDPOINT" ]; then
    echo '$RCLONE_S3_ENDPOINT must be set'
    exit 1
fi

if [ -z "$AWS_ACCESS_KEY_ID" -o -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo '$AWS_ACCESS_KEY_ID and $AWS_SECRET_ACCESS_KEY must be set'
    exit 1
fi

if [ -z "$BACKUP_PREFIX" ]; then
    BACKUP_PREFIX="pgbackup"
fi

if [ -z "$PG_HOST" ]; then
    echo '$PG_DATABASE must be set'
    exit 1
fi

if [ -z "$PG_PORT" ]; then
    PG_PORT="5432"
fi

if [ -z "$PG_DATABASE" ]; then
    echo '$PG_DATABASE must be set'
    exit 1
fi

if [ -z "$PG_USER" ]; then
    echo '$PG_USER must be set'
    exit 1
fi

if [ -z "$PG_PASSWD" ]; then
    echo '$PG_PASSWD must be set'
    exit 1
fi

TIMESTAMP="$(date -Iseconds --utc)"
BACKUP_NAME="$BACKUP_PREFIX-$TIMESTAMP.sql.gz"

echo "$PG_HOST:$PG_PORT:$PG_DATABASE:$PG_USER:$PG_PASSWD" > $HOME/.pgpass

pg_dump $PG_DATABASE | gzip -c > $BACKUP_NAME
sha256sum $BACKUP_NAME > $BACKUP_NAME.sha256sum

rclone copy $BACKUP_NAME s3:$S3_BUCKET/$BACKUP_NAME
rclone copy $BACKUP_NAME.sha256sum s3:$S3_BUCKET/$BACKUP_NAME.sha256sum

rm $HOME/.pgpass
rm $BACKUP_NAME
rm $BACKUP_NAME.sha256sum
