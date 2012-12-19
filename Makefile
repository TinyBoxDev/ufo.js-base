all:	test testweb

test:
	./node_modules/.bin/mocha test/*
	
testweb:
	./node_modules/.bin/mocha ./testweb/*

.PHONY: test testweb
