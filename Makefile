all:	compile test testweb
UNAME := $(shell uname)
ifeq ($(UNAME), Darwin)
	BROWSER := open
endif

compile:
	npm install
	./node_modules/.bin/browserify lib/client.js -o lib/client.bundle.js -i socket.io
	./node_modules/.bin/uglifyjs lib/client.bundle.js -o public/js/client.min.js
	rm lib/client.bundle.js

test:	compile
	NODE_PATH="./lib/" ./node_modules/.bin/mocha test/*
	
testweb:   compile
	$(BROWSER) ./testweb/runner.html

clean:
	rm public/js/client.min.js

.PHONY: compile test testweb
