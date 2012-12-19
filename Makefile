all:	test testweb
UNAME := $(shell uname)
ifeq ($(UNAME), Darwin)
	BROWSER := open
endif

test:
	./node_modules/.bin/mocha test/*
	
testweb:
	$(BROWSER) ./testweb/runner.html
	
.PHONY: test testweb
