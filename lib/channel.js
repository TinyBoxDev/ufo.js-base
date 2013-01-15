var Channel = function() {
	this.wrappedChannel = null;
}

Channel.prototype.send = null;

Channel.prototype.connectByName = function(serverAddress, onConnect) {
	this.wrappedChannel = new WebSocket(serverAddress);
	this.wrappedChannel.onopen = onConnect;
	this.configureSocket(this);
}

Channel.prototype.connectViaSocket = function(peerSocket, id) {
	if(this.wrappedChannel)
		this.wrappedChannel.close();
	this.wrappedChannel = peerSocket;
	this.configureSocket(this, id);
}

Channel.prototype.on = function(eventName, callback) {
	this[eventName] = callback;
}

Channel.prototype.configureSocket = function(channel, peerID) {
	
	var messageCallback = function(message) {
		console.log('Ricevuto un messaggio!');
		
		if(message.data)
			message = message.data
			
		message = new p2pPacket().fromString(message);
		
		if(message.isBoozer == true || message.path.length == 0)
			channel[message.type].call(channel, message);
		else
			client.carryHome(message);
	}
	
	var disconnectCallback = function() {
		client.pool.deleteConnectionByName(peerID);
		if(client.pretenders)
			client.pretenders.deleteConnectionByName(peerID);
		console.log('Client ' + peerID + ' disconnected!');
	}
	
	var sendAsBuffer = function(pkt) {
		console.log('sending something as blob!');
		if(pkt.isBoozer == true)
			pkt.addIDToPath(client.id);
			
		channel.wrappedChannel.send(pkt.toArrayBuffer());
	}
	
		
	var sendAsString = function(pkt) {
		console.log('sending something in plain!');
		console.log(pkt);
		if(pkt.isBoozer == true)
			pkt.addIDToPath(client.id);
		
		channel.wrappedChannel.send(pkt.toString());
	}
	
	if((typeof WebSocket != 'undefined' && channel.wrappedChannel instanceof WebSocket)) {
		console.log('setting for websocket');
		channel.wrappedChannel.onmessage = messageCallback;
		channel.wrappedChannel.onclose = disconnectCallback;
		channel.send = sendAsString;
		delete channel.close;
	} else if (channel.wrappedChannel.label === "datachannel") {
		console.log('setting elseif');
		channel.send = sendAsString;
		channel.on('close', disconnectCallback);
		channel.wrappedChannel.onmessage = messageCallback;
		//channel.wrappedChannel.onclose = disconnectCallback;
		channel.wrappedChannel.close = function() {
			channel.wrappedChannel.send(new p2pPacket('close', null, true));
			client.pool.deleteConnectionByName(peerID);
		}
	} else {
		console.log('setting for node');
		channel.wrappedChannel.on('message', messageCallback);
		channel.wrappedChannel.on('close', disconnectCallback);
		delete channel.close;
		channel.send = sendAsString;
	}
}

exports.Channel = window.Channel = Channel;
