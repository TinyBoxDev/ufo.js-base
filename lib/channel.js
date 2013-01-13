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
		console.log('Ricevuto un messaggio da websocket!');
		
		if(message.data)
			message = message.data
			
		packet = new p2pPacket().fromString(message);
		
		if(packet.isBoozer == true || packet.path.length == 0)
			channel[packet.type].call(channel, packet);
		else
			client.carryHome(packet);
	}
	
	var messageCallbackArrayBuffer = function(message) {
		console.log('Ricevuto un messaggio da datachannel!');
		
		message = new p2pPacket().fromArrayBuffer(message.data);
		
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
	} else if (channel.wrappedChannel.label === "datachannel") {
		console.log('setting elseif');
		channel.send = sendAsBuffer;
		channel.wrappedChannel.onmessage = messageCallbackBlob;
		channel.wrappedChannel.onclose = disconnectCallback;
	} else {
		console.log('setting for datachannel');
		channel.wrappedChannel.on('message', messageCallback);
		channel.wrappedChannel.on('close', disconnectCallback);
		channel.send = sendAsString;
	}
}

exports.Channel = window.Channel = Channel;
