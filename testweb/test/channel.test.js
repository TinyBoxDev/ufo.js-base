/*
	Test suite for channel.js
*/

require('should');
var assert = require('assert');
var Channel = require('../public/js/channel.js').Channel;

describe('Channel:\n', function(){
	var thisChannel = null;
	
	before(function(done){
		done();
	});
	
	after(function(done){
		done();
	});
	
	beforeEach(function(done){
		thisChannel = new Channel();
		done();
	});

	afterEach(function(done){
		done();
	});
});