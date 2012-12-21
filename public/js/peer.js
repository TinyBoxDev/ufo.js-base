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
	var localDescriptor = this.peerConnection.createOffer(onOfferCreated, generalFailureCallback);
}

var onOfferCreated = function(offer) {
	var packet = new p2pPacket('peering', new peeringPacket(offer));
	self.channel.send(packet);
}

var onPeeringReply = function(reply) {
	console.log(reply);
}

var generalFailureCallback = function(errorMessage) {
	throw errorMessage
}
