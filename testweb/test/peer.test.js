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
		thisPeer = new Peer('http://p2pwebsocket.herokuapp.com');
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

	it('Should have a peer connection object', function(done) {
		thisPeer.should.have.property('peerConnection');
		done();
	});

	it('The channel should have a peering reply method', function(done) {
		thisPeer.channel.should.have.property('peeringReply');
		done();
	});

	it('Should send a request to search a new peer', function(done) {
		var checkPacket = function(reply) {
			reply.should.have.property('offer');
			assert(reply.offer!=null);
			done();
		}	
		var newPeer = new Peer('http://echotestserver.herokuapp.com');
		newPeer.channel.on('peering', checkPacket);
		newPeer.lookForAPeer();
	});
});
