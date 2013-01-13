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
		
		if(message.data)
			message = message.data;

		var reader = new FileReader();
		reader.onloadend = function (evt) {
			console.log('Sto loggando!');
			if (evt.target.readyState == FileReader.DONE) {
				console.log(evt.target.result);
				message = new p2pPacket().compile(evt.target.result);
				if(message.isBoozer == true || message.path.length == 0)
					channel[message.type].call(channel, message);
				else
					client.carryHome(message);
			}
	       	};

		reader.readAsBinaryString(message.data);			
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
	
	var sendAsBlob = function(pkt) {
		if(pkt.isBoozer == true)
			pkt.addIdToPath(client.id);
			
		var str = pkt.toString();
		channel.wrappedChannel.send(new Blob([str]));
	}
	
	var send = function(pkt) {
		if(pkt.isBoozer == true)
			pkt.addIDToPath(client.id);
		
		var str = pkt.toString();	
		channel.wrappedChannel.send(str);
	}
	
	if(peerID != null)
		channel.send = send;
	else
		channel.send = sendAsBlob;
	
	/*
	channel.send = function(pkt) {
		if(pkt.isBoozer == true)
			pkt.addIDToPath(client.id);
		
		var str = pkt.toString();	
		channel.wrappedChannel.send(new Blob(['str']));
	}
	*/

}

exports.Channel = window.Channel = Channel;
