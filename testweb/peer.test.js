/*
	Test suite for peer.js
*/

require('should');
var assert = require('assert');
var Peer = require('../public/js/peer.js').Peer;

describe('Peer:\n', function(){
	var thisPeer = null;
	
	before(function(done){
		done();
	});
	
	after(function(done){
		done();
	});
	
	beforeEach(function(done){
		thisPeer = new Peer();
		done();
	});

	afterEach(function(done){
		done();
	});
	
	it('Should have a socket', function (done) {
		thisPeer.should.have.property('channel');
		done();
	});
	
});