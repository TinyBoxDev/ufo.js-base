var Channel = function() {
	this.wrappedChannel = null;
}

Channel.prototype.connectByName = function(serverAddress, onConnect) {
	var self = this;
	this.wrappedChannel = io.connect(serverAddress);
	this.wrappedChannel.on('connect', onConnect);
	this.wrappedChannel.on('reconnect', onConnect);
	this.wrappedChannel.on('p2pws', function(pkt) { 
		if(pkt.type && pkt.body)
			self[pkt.type].call(self, pkt.body);
	});
}

Channel.prototype.setChannel = function(peerSocket) {
	this.wrappedChannel = peerSocket;
}

Channel.prototype.send = function(packet) {
	this.wrappedChannel.emit('p2pws', packet);
}

Channel.prototype.on = function(eventName, callback) {
	this[eventName] = callback;
}


