#### Alpine Linux 3.9 wkhtmltopdf 0.12.5 (with patched qt)

Based on [alloylab/Docker-Alpine-wkhtmltopdf](https://github.com/alloylab/Docker-Alpine-wkhtmltopdf)

Certain wkhtmltopdf features cant be used with Alpine default wkhtmlpdf package, qt is unpatched. This container aim to build wkhtmltopdf and patched qt. The binary in this container is using shared library that can be fulfilled with installing Alpine default wkhtmltopdf package

Build step:

```
docker build -t aantonw/wkhtmltohtml .
docker run --name wkhtmltopdf -it aantonw/wkhtmltopdf bash

# copy build result to host
docker cp wkhtmltopdf:/lib/libwkhtmltox.so.0.12.5 wkhtmltox.so.0.12.5
docker cp wkhtmltopdf:/bin/wkhtmltopdf wkhtmltopdf
docker cp wkhtmltopdf:/bin/wkhtmltoimage wkhtmltoimage
```

Using binary to replace default wkhtmltopdf via Dockerfile:

```
FROM alpine:3.9

### install unpatched wkhtmltopdf
RUN apk add --update wkhtmltopdf

### replace binary and lib 
COPY wkhtmltopdf /usr/bin/wkhtmltopdf
COPY wkhtmltoimage /usr/bin/wkhtmltoimage
```

