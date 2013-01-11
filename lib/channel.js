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
	//console.log('setting event ' + eventName);
	this[eventName] = callback;
}

var configureSocket = function(channel, peerID) {
	console.log(typeof channel.wrappedChannel);

	var messageCallback = function(message, flags) {
		console.log(message.data);
		if(flags)
			message = new p2pPacket().compile(message);
		else
			message = new p2pPacket().compile(message.data);
			
		if(message.isBoozer || message.path.length == 0)
			channel[message.type].call(channel, message);
		else
			client.carryHome(message);
			
	}

	var disconnectCallback = function() {
		client.pool.deleteConnectionByName(peerID);
		console.log('Client ' + peerID + ' disconnected!');
	}

	if((typeof WebSocket != 'undefined' && channel.wrappedChannel instanceof WebSocket) || channel.wrappedChannel.label === "datachannel") {
		channel.wrappedChannel.onmessage = messageCallback;
		channel.wrappedChannel.onclose = disconnectCallback;
	}
	else {
		channel.wrappedChannel.on('message', messageCallback);
		channel.wrappedChannel.on('close', disconnectCallback);
	}

	channel.send = function(pkt) {
		if(pkt.isBoozer)
			pkt.addIDToPath(client.id);

		channel.wrappedChannel.send(pkt.toString());
	}

}

exports.Channel = window.Channel = Channel;
