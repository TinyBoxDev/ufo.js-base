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
			assert(new peeringPacket().fill(reply.body).toOffer() instanceof RTCSessionDescription);
			done();
		}	
		var onBootstrap = function() {
			thisPeer.channel.on('peering', checkPacket);
			thisPeer.lookForAPeer();
		}

		thisPeer = new Peer('ws://helloiampau.echotestserver.jit.su/', onBootstrap);
	});
	
	
	it('Should take an answer and perform connection', function(done) {
		client.id = 'molle';
		var remotePort = null;

		var candidatesArray = [];

		var onOffer = function(pkt) {
			console.log(pkt.body);
			
			var descriptor = new peeringPacket().fill(pkt.body).toOffer();

			pc.setRemoteDescription(descriptor, function() { setRemoteStuffs(pkt); }, function(error) { console.log(error); });

		}

		var setRemoteStuffs = function(pkt) {
						
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
					thisPeer.channel.send(new p2pPacket('peeringReply', new peeringReplyPacket(pc.localDescription, candidatesArray, client.id, self.localPort), false));
			}
		}
		var onBootstrap = function() {
			thisPeer.channel.on('peering', onOffer);
			thisPeer.lookForAPeer(function() { pc.close(); done(); } );
		}
		thisPeer = new Peer('ws://helloiampau.echotestserver.jit.su/', onBootstrap);		
	});
	
	
	it('Should prepare an answer and perform a connection', function(done) {
		client.id = 'cacca';
		
		var onOffer = function(offerPkt) {
			thisPeer.createSocketForPeer(offerPkt, function() { 
				done();
			});
		}

		client.carryHome = function(message) {
			secondPeer.channel.peeringReply(message);
		};

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
			thisPeer.channel.send(new p2pPacket('peering', new peeringPacket('my offer'), false));
		}

		thisPeer = new Peer('ws://helloiampau.echotestserver.jit.su/',  onBootstrap);

	});

		
	
});
