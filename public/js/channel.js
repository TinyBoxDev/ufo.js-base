var Channel = function() {
	this.wrappedChannel = null;
}

Channel.prototype.connectByName = function(serverAddress, onConnect) {
	var self = this;
	this.wrappedChannel = io.connect(serverAddress);
	this.wrappedChannel.on('connect', onConnect);
	configureSocketIoSocket(this);
}

Channel.prototype.connectViaSocket = function(peerSocket) {
	var self = this;
	if(peerSocket.socket instanceof io.Socket) {
		this.wrappedChannel = peerSocket;				
		configureSocketIoSocket(this);
	}
		
}

Channel.prototype.send = function(packet) {
	this.wrappedChannel.emit('p2pws', packet);
}

Channel.prototype.on = function(eventName, callback) {
	this[eventName] = callback;
}

var configureSocketIoSocket = function(channel) {
	channel.wrappedChannel.on('p2pws', function(pkt) { 
		if(pkt.type && pkt.body)
			channel[pkt.type].call(channel, pkt.body);
	});
}


