/*
	Test suite for peer.js
*/

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
	
	it('Should have a channel not null', function(done) {
		thisPeer.should.have.property('channel');
		assert(thisPeer.channel!=null);
		done();
	});

	it('Should have a local and a remote descriptor', function(done) {
		thisPeer.should.have.property('localDescriptor');
		thisPeer.should.have.property('remoteDescriptor');
		done();
	});
});
