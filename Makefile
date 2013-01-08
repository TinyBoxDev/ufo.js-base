all:	compile test testweb
UNAME := $(shell uname)
ifeq ($(UNAME), Darwin)
	BROWSER := /Applications/FirefoxNightly.app/Contents/MacOS/firefox
endif

compile_test:
	npm install
	./node_modules/.bin/browserify lib/client.js -o lib/client.bundle.js -i socket.io

compile: compile_test
	./node_modules/.bin/uglifyjs lib/client.bundle.js -o public/js/client.min.js

test:	compile_test
	NODE_PATH="./lib/" ./node_modules/.bin/mocha --reporter spec test/*.server.*
	
testweb:   compile_test
	$(BROWSER) ./testweb/runner.html &

clean:
	rm -rf ./node_modules
	rm public/js/client.min.js
	rm lib/client.bundle.js 

.PHONY: compile test testweb
