FROM python:3.7-alpine

ADD ./nukebucket /usr/bin/
RUN pip install boto3 && chmod +x /usr/bin/nukebucket
ENTRYPOINT ["nukebucket"]
