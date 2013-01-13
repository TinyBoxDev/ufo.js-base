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
	if(this.wrappedChannel)
		this.wrappedChannel.close();
	this.wrappedChannel = peerSocket;				
	configureSocket(this, id);
}

Channel.prototype.on = function(eventName, callback) {
	this[eventName] = callback;
}

var configureSocket = function(channel, peerID) {
	var messageCallback = function(message) {
		console.log('Ricevuto un messaggio!');
		if(message.data) {
			console.log(message.data);
			message = new p2pPacket().compile(message.data);
		} else {
			console.log(message);
			message = new p2pPacket().compile(message);
		}
			
		
		if(message.isBoozer == true || message.path.length == 0)
			channel[message.type].call(channel, message);
		else
			client.carryHome(message);
			
	}

	var disconnectCallback = function() {
		client.pool.deleteConnectionByName(peerID);
		console.log('Client ' + peerID + ' disconnected!');
		if(client.pretenders)
			client.pretenders.deleteConnectionByName(peerID);
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
		if(pkt.isBoozer == true)
			pkt.addIDToPath(client.id);
		
		var str = new Blob([pkt]);	
		channel.wrappedChannel.send(str);
	}

}

exports.Channel = window.Channel = Channel;
