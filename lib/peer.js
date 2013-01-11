var Channel = require('./channel').Channel;
var p2pPacket = require('./p2pPacket').p2pPacket;
var peeringPacket = require('./peeringPacket').peeringPacket;
var peeringReplyPacket = require('./peeringReplyPacket').peeringReplyPacket;
var setIdPacket = require('./setIdPacket').setIdPacket;

var Peer = function(bootstrapServerAddress, onBootstrapPerformed) {
	console.log('Connecting peer with BSS...');
	var self = this;
	this.channel = new Channel();
	
	this.channel.on('setId', function(setIdPacket) {
		console.log('Setting your id...');
		client.id = setIdPacket.body.id;
		self.lookForAPeer(client.onPeerFound);
		//console.log(client.id);
	});
	
	this.channel.on('peering', function(peeringPacket) {
		client.onPeering(peeringPacket, self);
	});
	
	this.peerConnection = null;
	
	this.localPort = Math.round(Math.random() * (500)) + 5000;
	this.remotePort = null;

	if(bootstrapServerAddress)
		this.channel.connectByName(bootstrapServerAddress, onBootstrapPerformed);
}

Peer.prototype.setSocketForPeer = function(socket, id) {
	this.channel.connectViaSocket(socket, id);
	//console.log('for peer id: ' + id);
	if(id)
		this.channel.send(new p2pPacket('setId', new setIdPacket(id), false));
}

/*
Peer.prototype.sendPeeringReply = function(answer) {
	this.channel.send(new p2pPacket('peeringReply', new peeringReplyPacket(answer)));
}
*/

Peer.prototype.createSocketForPeer = function(peeringPacket, callingPeer, onConnected) {
	var self = this;

	var candidatesArray = [];

	// 3. once added the remote description
	var onRemoteDescriptionAdded = function() {
		peeringPacket.body.candidates.forEach(function(candidate){
			self.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  		});
			
		self.peerConnection.createAnswer(onAnswerCreated, generalFailureCallback, {});		
	}

	// 4. once answer created
	var onAnswerCreated = function(answer) {
		self.peerConnection.setLocalDescription(answer);
	}

	// 1. create a peerconnection object
	this.peerConnection = new webkitRTCPeerConnection(null, { optional: [ { RtpDataChannels: true } ] });
	// 2. set the connection callback
	this.peerConnection.onicecandidate = function(event) {
		if (event.candidate) {
			candidatesArray.push(event.candidate);
			if (candidatesArray.length == 2) {
				var pkt = new p2pPacket('peeringReply',
							new peeringReplyPacket(self.peerConnection.localDescription, candidatesArray, client.id, self.localPort), false);
				pkt.path = peeringPacket.path;
				client.carryHome(pkt);
			}
		}
	}

	this.peerConnection.ondatachannel = function(event) {
		//console.log('new channel')
		var newDataChannel = event.channel;
		newDataChannel.onopen = function() {
			//console.log('Datachannel open');
			self.channel.connectViaSocket(newDataChannel, peeringPacket.body.originator);
			onConnected();	
		};	
	}

	this.peerConnection.setRemoteDescription(new RTCSessionDescription(peeringPacket.body.offer), onRemoteDescriptionAdded, generalFailureCallback);
		


}

//Peer.prototype.createSocketForPeer = function(peeringPacket, callingPeer, onConnected) {
//	var self = this;
//
//	/* Step 0R of the peering process: set a fake audio stream */
//	var onFakeStreamDone = function(stream) {
//		self.peerConnection.addStream(stream);
//		self.peerConnection.setRemoteDescription(peeringPacket.body.offer, onOfferAdded, generalFailureCallback);
//	}
//
//	/* Step 1R of the peering process: prepare an answer */
//	var onOfferAdded = function() {
//		self.peerConnection.createAnswer(onAnswerCreated, generalFailureCallback);
//	}
//
//	/* Step 2R of the peering process: send answer back to callingPeer and set it as local description */
//	var onAnswerCreated = function(answer) {
//		console.log('local port ' + self.localPort);
//		var peeringReply = new p2pPacket('peeringReply', new peeringReplyPacket(answer, client.id, self.localPort));
//		peeringReply.path = peeringPacket.path;
//		callingPeer.send(peeringReply);
//		self.peerConnection.setLocalDescription(answer, connectToPeer, generalFailureCallback);
//	}
//
//	/* Step 3R of the peering process: connect to peer */
//	var connectToPeer = function() {
//		self.peerConnection.connectDataConnection(self.localPort, self.remotePort);
//	}	
//
//	this.peerConnection = new mozRTCPeerConnection();
//	this.remotePort = peeringPacket.body.port;
//
//	/* Step 4R of the peering process: save data channel as new wrapped channel */
//	this.peerConnection.onconnection = function() {
//		self.channel.connectViaSocket(self.peerConnection.createDataChannel("Reliable data channel :)",{}), peeringPacket.body.originator);
//		onConnected();
//	}
//
//	navigator.mozGetUserMedia({audio:true, fake:true}, onFakeStreamDone, generalFailureCallback);
//}

Peer.prototype.lookForAPeer = function(onPeerFound) {
	var self = this;
	var retrievedPeerId = null;

	var candidatesArray = [];

	// 6. send the offer when ready
	var onOfferCreated = function(offer) {
		self.peerConnection.setLocalDescription(offer);
		//self.channel.send(new p2ddpPacket('peering', new peeringPacket(offer, client.id, self.localPort)));
	}

	// 7. inspect the reply and choose from datachannel or websocket
	var onPeeringReply = function(reply) {
		retrievedPeerId = reply.body.originator;

		if(reply.body.answer) {
			self.remotePort = reply.body.port;
			self.peerConnection.setRemoteDescription(new RTCSessionDescription(reply.body.answer));

			reply.body.candidates.forEach(function(candidate){
				console.log(candidate);
				self.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  			});

		}
		else {
			client.pool.pushConnection(reply.body.originator, this);
			onPeerFound();
		}
		
		self.peerconnection = null;

	}
	
	// 1. create a peerconnection object
	this.peerConnection = new webkitRTCPeerConnection(null, { optional: [ { RtpDataChannels: true } ] });
	// 2. set the connection callback
	this.peerConnection.onicecandidate = function(event) {
		if (event.candidate) {
			candidatesArray.push(event.candidate);
			if (candidatesArray.length == 4)
				self.channel.send(new p2pPacket('peering', 
							new peeringPacket(self.peerConnection.localDescription, candidatesArray, client.id, self.localPort), true));
		}
	}
	
	// 3. create a temporany data channel
	var localDataChannel = this.peerConnection.createDataChannel('datachannel', { reliable : false });
	// 4. set this data channel as peer channel when it connects
	localDataChannel.onopen = function() {
		//console.log('Datachannel open');
		client.pool.pushConnection(reply.body.originator, this);
		self.channel.connectViaSocket(this);
		onPeerFound();
       	};

	this.channel.on('peeringReply', onPeeringReply);

	// 5. create an offer
	this.peerConnection.createOffer(onOfferCreated, generalFailureCallback, {});
}

//Peer.prototype.lookForAPeer = function(onPeerFound) {
//	var self = this;
//	
//	var retrievedPeerId = null;
//
//	/* Step 0I of the peering process: set a fake audio stream */
//	var onFakeStreamDone = function(stream) {
//		self.peerConnection.addStream(stream);
//		self.peerConnection.createOffer(onOfferCreated, generalFailureCallback);
//	}
//
//	/* Step 1I of the peering process: prepare an offer and send it to bootstrap server */
//	var onOfferCreated = function(offer) {
//		self.peerConnection.setLocalDescription(offer);
//		self.channel.send(new p2pPacket('peering', new peeringPacket(offer, client.id, self.localPort)));
//	}
//	
//	/* Step 2I of the peering process: take the answer received and instantiate a datachannel */
//	var onPeeringReply = function(reply) {
//		retrievedPeerId = reply.body.originator;
//
//		if(reply.body.answer) {
//			self.remotePort = reply.body.port;
//			self.peerConnection.setRemoteDescription(reply.body.answer, connectToPeer);
//		}
//		else
//			onPeerFound();
//	}
//
//	/* Step 3I of the peering process: connect to peer */
//	var connectToPeer = function() {
//		self.peerConnection.connectDataConnection(self.localPort, self.remotePort);
//	}	
//	
//	this.channel.on('peeringReply', onPeeringReply);
//	this.peerConnection = new mozRTCPeerConnection();
//
//	/* Step 4I of the peering process: save data channel as new wrapped channel */
//	this.peerConnection.onconnection = function() {
//		self.channel.connectViaSocket(self.peerConnection.createDataChannel("Reliable data channel :)",{}), retrievedPeerId);
//		onPeerFound();
//	}
//
//	navigator.mozGetUserMedia({audio:true, fake:true}, onFakeStreamDone, generalFailureCallback);	
//}

Peer.prototype.send = function(packet) {
	this.channel.send(packet);	
}

var generalFailureCallback = function(errorMessage) {
	throw errorMessage
}

exports.Peer = window.Peer = Peer;
