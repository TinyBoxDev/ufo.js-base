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
	var messageCallback = function(message, flags) {
		if(flags)
			message = JSON.parse(message);
		else
			message = JSON.parse(message.data);

		if(message.type && message.body)
			channel[message.type].call(channel, message.body);
	}

	if(typeof WebSocket != 'undefined' && channel.wrappedChannel instanceof WebSocket)
		channel.wrappedChannel.onmessage = messageCallback;
	else
		channel.wrappedChannel.on('message', messageCallback);

	channel.send = function(pkt) {
		channel.wrappedChannel.send(pkt.toString());
	}

}

exports.Channel = window.Channel = Channel;
