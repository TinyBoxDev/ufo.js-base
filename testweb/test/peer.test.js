/*
	Test suite for peer.js
*/

describe('Peer:\n', function(){
	this.timeout(15000);
	var thisPeer = null;
	
	before(function(done){
		done();
	});
	
	after(function(done){
		done();
	});
	
	beforeEach(function(done){
		thisPeer = new Peer('ws://helloiampau.echotestserver.jit.su/');
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

	it('Should send a request to search a new peer', function(done) {
		var checkPacket = function(reply) {
			reply.should.have.property('offer');
			assert(reply.offer!=null);
			done();
		}	
		var onBootstrap = function() {
			thisPeer.channel.on('peering', checkPacket);
			thisPeer.lookForAPeer();
		}

		thisPeer = new Peer('ws://helloiampau.echotestserver.jit.su/', onBootstrap);
	});

	it('Should take an answer and perform connection', function(done) {
		var onOffer = function(pkt) {
			pc.setRemoteDescription(pkt.offer, prepareAnswer, function(){});
		}
		var prepareAnswer = function() {
			pc.createAnswer(sendAnswer, function(){});
		}
		var sendAnswer = function(answer) {
			pc.setLocalDescription(answer);
			thisPeer.channel.send(new p2pPacket('peeringReply', new peeringReplyPacket(answer)));
			setTimeout(function() {
				pc.connectDataConnection(5001,5000);
			}, 2000);

		}
		
		var pc = new mozRTCPeerConnection();		
		var onBootstrap = function() {
			pc.onconnection = function() {
				done();
			}
			thisPeer.channel.on('peering', onOffer);
			navigator.mozGetUserMedia({audio:true, fake:true}, function(s) {
	      			pc.addStream(s);
	 		}, function(err) { alert("Error " + err); });
			thisPeer.lookForAPeer();
		}
		thisPeer = new Peer('ws://helloiampau.echotestserver.jit.su/', onBootstrap);		
	});
	
	it('Should manage a peering request', function(done) {
		var onPeering = function(peering) {
			done();
		}
		
		var onBootstrap = function() {
			thisPeer.channel.on('peering', onPeering);
			thisPeer.channel.send(new p2pPacket('peering', new peeringPacket('my offer')));
		}

		thisPeer = new Peer('ws://helloiampau.echotestserver.jit.su/',  onBootstrap);

	});

	it('Should send peering reply', function(done) {
		var onPeeringReply = function(reply) {
			assert(reply.answer == 'cacca');
			done();
		}

		var onBootstrap = function() {
			thisPeer.channel.on('peeringReply', onPeeringReply);
			thisPeer.sendPeeringReply('cacca');
		}

		thisPeer = new Peer('ws://helloiampau.echotestserver.jit.su/',  onBootstrap);

	});
	
});
