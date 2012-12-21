var Peer = function() {
	this.localDescriptor = null;
	this.remoteDescriptor = null;

	this.channel = new Channel();
}
