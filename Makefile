
BIN := $(PWD/bin)
ASCIIDOC_IMAGE := asciidoctor/docker-asciidoctor:latest

docs:
	mkdir -p $(PWD)/build
	docker run -v $(PWD):/documents/ $(ASCIIDOC_IMAGE) asciidoctor -a toc -o build/index.html -r asciidoctor-diagram README.adoc

docs-dev:
	nodemon -e adoc -w src/ -x make docs
