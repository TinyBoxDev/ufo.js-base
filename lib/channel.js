var Channel = function() {
	this.wrappedChannel = null;
}

Channel.prototype.send = null;

Channel.prototype.connectByName = function(serverAddress, onConnect) {
	this.wrappedChannel = new WebSocket(serverAddress);
	this.wrappedChannel.onopen = onConnect;
	configureSocket(this);	
}

Channel.prototype.connectViaSocket = function(peerSocket, id) {
	this.wrappedChannel = peerSocket;				
	configureSocket(this, id);		
}

Channel.prototype.on = function(eventName, callback) {
	this[eventName] = callback;
}

var configureSocket = function(channel, peerID) {
	var messageCallback = function(message, flags) {
		console.log('Yooooooo ' + message);
		if(flags)
			message = JSON.parse(message);
		else
			message = JSON.parse(message.data);
			
		if(message.type && message.body)
			//channel[message.type].call(channel, message.body);
			channel[message.type].call(channel, message);
	}

	var disconnectCallback = function() {
		client.pool.deleteConnectionByName(peerID);
		console.log('Client ' + peerID + ' disconnected!');
	}

	if(typeof WebSocket != 'undefined' && channel.wrappedChannel instanceof WebSocket) {
		channel.wrappedChannel.onmessage = messageCallback;
		channel.wrappedChannel.onclose = disconnectCallback;
	}
	else {
		channel.wrappedChannel.on('message', messageCallback);
		channel.wrappedChannel.on('close', disconnectCallback);
	}

	channel.send = function(pkt) {
		pkt.addIDToPath(client.id);
		channel.wrappedChannel.send(pkt.toString());
		console.log(pkt);
	}


}

exports.Channel = window.Channel = Channel;
