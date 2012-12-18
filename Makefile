test:
	./node_modules/.bin/mocha
	
testweb:
	phantomjs ./testweb/run-mocha.js ./testweb/testspage.html

.PHONY: test testweb
