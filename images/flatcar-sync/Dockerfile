FROM python:3.12-alpine

RUN apk add --no-cache gnupg \
    && pip install --no-cache-dir requests boto3

COPY --chmod=0444 flatcar.gpg /usr/local/share/flatcar.gpg

# RUN gpg --batch --import /usr/local/share/flatcar.gpg

COPY --chmod=0755 sync.py /usr/local/bin/sync.py

ENTRYPOINT ["/usr/local/bin/sync.py"]
