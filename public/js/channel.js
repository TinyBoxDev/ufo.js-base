var Channel = function() {
	this.wrappedChannel = null;
	this.peerConnection = null;
}

Channel.prototype.connectByName = function(serverAddress, onConnected) {
	this.wrappedChannel = io.connect(serverAddress);
	this.wrappedChannel.on('connect', onConnected);
}

Channel.prototype.getNewOffer = function(onOfferCreated) {
	this.peerConnection = new mozRTCPeerConnection();
	this.peerConnection.createOffer(onOfferCreated, generalFailureCallback);	
}

Channel.prototype.send = function(packet, onReplyReceived) {
	this.wrappedChannel.on('p2pws', onReplyReceived);
	this.wrappedChannel.emit('p2pws', packet);
}

var generalFailureCallback = function(errorMessage) {
	throw errorMessage
}
