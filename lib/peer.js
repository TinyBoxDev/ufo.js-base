var Channel = require('./channel').Channel;
var p2pPacket = require('./p2pPacket').p2pPacket;
var peeringPacket = require('./peeringPacket').peeringPacket;
var peeringReplyPacket = require('./peeringReplyPacket').peeringReplyPacket;
var setIdPacket = require('./setIdPacket').setIdPacket;

var Peer = function(bootstrapServerAddress, onBootstrapPerformed) {
	var self = this;
	this.channel = new Channel();
	this.channel.on('setId', function(setIdPacket) {
		client.id = setIdPacket.body.id;
	});
	this.channel.on('peering', function(peeringPacket) {
		client.onPeering(peeringPacket, self);
	});
	
	this.peerConnection = null;

	if(bootstrapServerAddress)
		this.channel.connectByName(bootstrapServerAddress, onBootstrapPerformed);
}

Peer.prototype.setSocketForPeer = function(socket, id) {
	this.channel.connectViaSocket(socket, id);
	if(id)
		this.channel.send(new p2pPacket('setId', new setIdPacket(id)));
}

Peer.prototype.sendPeeringReply = function(answer) {
	this.channel.send(new p2pPacket('peeringReply', new peeringReplyPacket(answer)));
}

Peer.prototype.createSocketForPeer = function(peeringPacket, callingPeer, onConnected) {
	var self = this;

	/* Step 0R of the peering process: set a fake audio stream */
	var onFakeStreamDone = function(stream) {
		self.peerConnection.addStream(stream);
		self.peerConnection.setRemoteDescription(peeringPacket.body.offer, onOfferAdded, generalFailureCallback);
	}

	/* Step 1R of the peering process: prepare an answer */
	var onOfferAdded = function() {
		self.peerConnection.createAnswer(onAnswerCreated, generalFailureCallback);
	}

	/* Step 2R of the peering process: send answer back to callingPeer and set it as local description */
	var onAnswerCreated = function(answer) {
		var peeringReply = new p2pPacket('peeringReply', new peeringReplyPacket(answer, client.id));
		peeringReply.path = peeringPacket.path;
		callingPeer.send(peeringReply);
		self.peerConnection.setLocalDescription(answer, connectToPeer, generalFailureCallback);
	}

	/* Step 3R of the peering process: connect to peer */
	var connectToPeer = function() {
		self.peerConnection.connectDataConnection(5001,5000);
	}	

	this.peerConnection = new mozRTCPeerConnection();

	/* Step 4R of the peering process: save data channel as new wrapped channel */
	this.peerConnection.onconnection = function() {
		self.channel.connectViaSocket(self.peerConnection.createDataChannel("Reliable data channel :)",{}), peeringPacket.body.originator);
		onConnected();
	}

	navigator.mozGetUserMedia({audio:true, fake:true}, onFakeStreamDone, generalFailureCallback);
}

Peer.prototype.lookForAPeer = function(onPeerFound) {
	var self = this;
	
	var retrievedPeerId = null;

	/* Step 0I of the peering process: set a fake audio stream */
	var onFakeStreamDone = function(stream) {
		self.peerConnection.addStream(stream);
		self.peerConnection.createOffer(onOfferCreated, generalFailureCallback);
	}

	/* Step 1I of the peering process: prepare an offer and send it to bootstrap server */
	var onOfferCreated = function(offer) {
		self.peerConnection.setLocalDescription(offer);
		self.channel.send(new p2pPacket('peering', new peeringPacket(offer, client.id)));
	}
	
	/* Step 2I of the peering process: take the answer received and instantiate a datachannel */
	var onPeeringReply = function(reply) {
		retrievedPeerId = reply.body.originator;

		if(reply.body.answer)
			self.peerConnection.setRemoteDescription(reply.body.answer, connectToPeer);
		else
			onPeerFound();
	}

	/* Step 3I of the peering process: connect to peer */
	var connectToPeer = function() {
		self.peerConnection.connectDataConnection(5000,5001);
	}	
	
	this.channel.on('peeringReply', onPeeringReply);
	this.peerConnection = new mozRTCPeerConnection();

	/* Step 4I of the peering process: save data channel as new wrapped channel */
	this.peerConnection.onconnection = function() {
		self.channel.connectViaSocket(self.peerConnection.createDataChannel("Reliable data channel :)",{}), retrievedPeerId);
		onPeerFound();
	}

	navigator.mozGetUserMedia({audio:true, fake:true}, onFakeStreamDone, generalFailureCallback);	
}

Peer.prototype.send = function(packet) {
	this.channel.send(packet);	
}

var generalFailureCallback = function(errorMessage) {
	throw errorMessage
}

exports.Peer = window.Peer = Peer;
