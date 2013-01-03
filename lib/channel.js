var Channel = function() {
	this.wrappedChannel = null;
}

Channel.prototype.send = null;

Channel.prototype.connectByName = function(serverAddress, onConnect) {
	this.wrappedChannel = new WebSocket(serverAddress);
	this.wrappedChannel.onopen = onConnect;
	configureSocket(this);	
}

Channel.prototype.connectViaSocket = function(peerSocket) {
	this.wrappedChannel = peerSocket;				
	configureSocket(this);		
}

Channel.prototype.on = function(eventName, callback) {
	this[eventName] = callback;
}

var configureSocket = function(channel) {
	channel.wrappedChannel.onmessage = function(message) {
		message = JSON.parse(message);
		if(message.type && message.body)
			channel[pkt.type].call(channel, pkt.body);
	}
	channel.send = function(pkt) {
		channel.wrappedChannel.send(pkt);
	}

}

exports.Channel = window.Channel = Channel;
