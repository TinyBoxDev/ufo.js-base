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
		if(!document.getElementById('ioscript')) {
			var ioscript = document.createElement('script');
			ioscript.src = "http://echotestserver.herokuapp.com/socket.io/socket.io.js";
			ioscript.id = "ioscript"
			document.getElementsByTagName('head')[0].appendChild(ioscript);
		}
		thisPeer = new Peer('http://echotestserver.herokuapp.com');
		setTimeout(done, 1000);
	//	done();
	});

	afterEach(function(done){
		if(thisPeer.channel.wrappedChannel) {
			thisPeer.channel.wrappedChannel.disconnect();						
			var ioscript = document.getElementById('ioscript');
			ioscript.parentNode.removeChild(ioscript);
			var poolnode = document.getElementsByTagName('script')[0];
			poolnode.parentNode.removeChild(poolnode);
			var iosocketform = document.getElementsByClassName('socketio')[0];
			if(iosocketform)
				iosocketform.parentNode.removeChild(iosocketform);
		}
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
		thisPeer.channel.on('peering', checkPacket);
		thisPeer.lookForAPeer();
	});

	it('Should take an answer and perform the connection', function(done) {
		var onOffer = function(pkt) {
			pc.setRemoteDescription(pkt.offer, prepareAnswer, function(){});
		}
		var prepareAnswer = function() {
			pc.createAnswer(sendAnswer, function(){});
		}
		var sendAnswer = function(answer) {
			pc.setLocalDescription(answer);
			thisPeer.channel.send(new p2pPacket('peeringReply', new peeringReplyPacket(answer)));
		}
		var checkDataChannel = function(loadedPeerConnection) {
			setTimeout(function() {
				loadedPeerConnection.connectDataConnection(5000,5001);
				pc.connectDataConnection(5001,5000);
			}, 2000);
		}
		var pc = new mozRTCPeerConnection();		
		pc.onconnection = function() {
			console.log('connesso');
			done();
		}
		thisPeer.channel.connectToPeer = checkDataChannel; 
		thisPeer.channel.on('peering', onOffer);
		navigator.mozGetUserMedia({audio:true, fake:true}, function(s) {
	      		pc.addStream(s);
	 	}, function(err) { alert("Error " + err); });
		thisPeer.lookForAPeer();			
	});
	
	it('Should manage a peering request', function(done) {
		var onPeering = function() {
			done();
		}
		
		thisPeer.setPeeringCallback(onPeering);
		thisPeer.channel.send(new p2pPacket('peering', new peeringPacket('my offer')));
	});
	
});
