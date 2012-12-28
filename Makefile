all:	test testweb
UNAME := $(shell uname)
ifeq ($(UNAME), Darwin)
	BROWSER := open
endif

test:
	NODE_PATH="./lib/:./public/js/" ./node_modules/.bin/mocha test/*
	
testweb:
	$(BROWSER) ./testweb/runner.html
	
.PHONY: test testweb
