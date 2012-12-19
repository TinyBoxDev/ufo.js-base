var Peer = function() {
	this.channel = null;
}

Peer.prototype.connect = function(bootstrapAddress, whenConnected) {
	this.channel = io.connect(bootstrapAddress);
	whenConnected();
}

module.exports.Peer = Peer;