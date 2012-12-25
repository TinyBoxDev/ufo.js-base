var self = null;

var Peer = function(bootstrapServerAddress) {
	this.peerConnection = null;

	this.channel = new Channel();
	this.channel.on('peeringReply', onPeeringReply);
	this.channel.connectByName(bootstrapServerAddress);
	self = this;
}

Peer.prototype.lookForAPeer = function() {
	this.peerConnection = new mozRTCPeerConnection();
	navigator.mozGetUserMedia({audio:true, fake:true}, onFakeStreamDone, generalFailureCallback);	
}

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
	self.peerConnection.setRemoteDescription(reply.answer);
	this.connectToPeer(self.peerConnection);
}

var generalFailureCallback = function(errorMessage) {
	throw errorMessage
}
