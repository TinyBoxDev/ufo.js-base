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
	console.log('Configuring socket with peer ');
	console.log(peerID);
	
	var messageCallback = function(message) {
		console.log('Ricevuto un messaggio da websocket!');
		
		var packet = new p2pPacket();
		
		if(message.data)
			packet = packet.compile(message.data);
		
		if(packet.isBoozer == true || packet.path.length == 0)
			channel[packet.type].call(channel, packet);
		else
			client.carryHome(packet);
	}
	
	var messageCallbackBlob = function(message) {
		console.log('Ricevuto un messaggio da datachannel!');
		if(message.data)
			message = message.data;
		
		var reader = new FileReader();
		reader.onload = function (evt) {
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
		channel.wrappedChannel.on('message', messageCallbackBlob);
		channel.wrappedChannel.on('close', disconnectCallback);
	}
	
	/*
	var sendAsBlob = function(pkt) {
		console.log('sending something as blob!');
		console.log(pkt);
		if(pkt.isBoozer == true)
			pkt.addIdToPath(client.id);
			
		var str = pkt.toString();
		console.log(str);
		channel.wrappedChannel.send(new Blob([str]));
	}
	*/
	
	var plainSend = function(pkt) {
		console.log('sending something in plain!');
		console.log(pkt);
		if(pkt.isBoozer == true)
			pkt.addIDToPath(client.id);
		
		var str = pkt.toString();
		console.log(str);
		channel.wrappedChannel.send(str);
	}
	
	if(channel.wrappedChannel instanceof WebSocket) {
		console.log('setting plain send...');
		channel.send = plainSend;
	}
	else {
		console.log('setting blob send...');
		channel.send = sendAsBlob;
	}
	
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
