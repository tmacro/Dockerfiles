FROM python:3-alpine as errors

RUN pip install jinja2

ADD ./bin/gen-errors.py ./errors.json ./templates/error.html.j2 /error-gen/

WORKDIR /error-gen

RUN python gen-errors.py --input errors.json --template error.html.j2 --output errors

FROM nginx:latest

ADD ./nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=errors /error-gen/errors /usr/share/campfire/html

# /usr/share/campire/errors
