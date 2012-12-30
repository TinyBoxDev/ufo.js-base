var Channel = require('./channel').Channel;
var p2pPacket = require('./p2pPacket').p2pPacket;
var peeringPacket = require('./peeringPacket').peeringPacket;
var peeringReplyPacket = require('./peeringReplyPacket').peeringReplyPacket;

var Peer = function(bootstrapServerAddress) {
	var self = this;
	this.channel = new Channel();
	
	if(bootstrapServerAddress) {
		this.peerConnection = null;
		this.channel.connectByName(bootstrapServerAddress);
	}
}

Peer.prototype.setSocketForPeer = function(socket) {
	this.channel.connectViaSocket(socket);
}

Peer.prototype.sendPeeringReply = function(answer) {
	this.channel.send(new p2pPacket('peeringReply', new peeringReplyPacket(answer)));
}

Peer.prototype.lookForAPeer = function(onPeerFound) {
	var self = this;

	/* Step 0I of the peering process: set a fake audio stream */
	var onFakeStreamDone = function(stream) {
		self.peerConnection.addStream(stream);
		self.peerConnection.createOffer(onOfferCreated, generalFailureCallback);
	}

	/* Step 1I of the peering process: prepare an offer and send it to the bootstrap server */
	var onOfferCreated = function(offer) {
		var packet = new p2pPacket('peering', new peeringPacket(offer));
		self.peerConnection.setLocalDescription(offer);
		self.channel.send(packet);
	}
	
	/* Step 2I of the peering process: take the answer received and instantiate a datachannel */
	var onPeeringReply = function(reply) {
		if(reply.answer)
			self.peerConnection.setRemoteDescription(reply.answer, connectToPeer);
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
		self.channel.connectViaSocket(self.peerConnection.createDataChannel("Reliable data channel :)",{}));
		onPeerFound();
	}

	navigator.mozGetUserMedia({audio:true, fake:true}, onFakeStreamDone, generalFailureCallback);	
}

var generalFailureCallback = function(errorMessage) {
	throw errorMessage
}

if(typeof window === 'undefined')
	window = global;

exports.Peer = window.Peer = Peer;