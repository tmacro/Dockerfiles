FROM tmacro/base:latest

RUN apk_add python3

ONBUILD ADD . /app
ONBUILD RUN python3 -m pip install -r /app/requirements.txt
