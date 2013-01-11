/*
	Test suite for peer.js
*/

describe('Peer:\n', function(){
	this.timeout(30000);
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
			reply.body.should.have.property('offer');
			assert(reply.body.offer!=null);
			done();
		}	
		var onBootstrap = function() {
			thisPeer.channel.on('peering', checkPacket);
			thisPeer.lookForAPeer();
		}

		thisPeer = new Peer('ws://helloiampau.echotestserver.jit.su/', onBootstrap);
	});
	
	
	it('Should take an answer and perform connection', function(done) {
		var remotePort = null;

		var candidatesArray = [];

		var onOffer = function(pkt) {
			console.log(pkt.body);
			remotePort = pkt.body.port;
			
			var descriptor = new RTCSessionDescription(pkt.body.offer);

			pc.setRemoteDescription(descriptor, function() { setRemoteStuffs(pkt); }, function(error) { console.log(error); });

		}

		var setRemoteStuffs = function(pkt) {
			pkt.body.candidates.forEach(function(candidate){
				console.log(candidate);
				pc.addIceCandidate(new RTCIceCandidate(candidate));
  			});
			
			pc.createAnswer(onAnswer, function(){});
			
		}
		
		var onAnswer = function(answer) {
			console.log('sendAnswer');			
			pc.setLocalDescription(answer);
		}
		
		var pc = new webkitRTCPeerConnection( null, { optional: [ { RtpDataChannels: true } ] });
		var dc = null;
		pc.ondatachannel = function(event) {
			dc = event.channel;
			dc.onopen = function() { 
				console.log('open')				
		       	};	
		}

		pc.onicecandidate = function(event) {	
			if (event.candidate) {
				candidatesArray.push(event.candidate);
				if (candidatesArray.length == 2)
					thisPeer.channel.send(new p2pPacket('peeringReply', new peeringReplyPacket(pc.localDescription, candidatesArray, client.id, self.localPort)));
			}
		}
		var onBootstrap = function() {
			thisPeer.channel.on('peering', onOffer);
			thisPeer.lookForAPeer(function() { pc.close(); done(); } );
		}
		thisPeer = new Peer('ws://helloiampau.echotestserver.jit.su/', onBootstrap);		
	});
	
	
	it('Should prepare an answer and perform a connection', function(done) {
		
		var onOffer = function(offerPkt) {
			thisPeer.createSocketForPeer(offerPkt, secondPeer, function() { 
				done();
			});
		}

		var onBootstrap = function() {
			secondPeer.channel.on('peering', onOffer);						
			secondPeer.lookForAPeer(function() { console.log('SecondPeer ends') });
		}
		var secondPeer = new Peer('ws://helloiampau.echotestserver.jit.su/', onBootstrap);
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
			assert(reply.body.answer == 'cacca');
			done();
		}

		var onBootstrap = function() {
			thisPeer.channel.on('peeringReply', onPeeringReply);
			thisPeer.sendPeeringReply('cacca');
		}

		thisPeer = new Peer('ws://helloiampau.echotestserver.jit.su/',  onBootstrap);

	});

	
	
});
