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
	//console.log('setting event ' + eventName);
	this[eventName] = callback;
}

var configureSocket = function(channel, peerID) {
	//console.log('setting channel for peer id + ' + peerID);
	var messageCallback = function(message) {
		//console.log(message);
		if(message.data) {
			//console.log('no message.data!');
			message = new p2pPacket().compile(message.data);
		} else {
			//console.log('yes message.data!');
			message = new p2pPacket().compile(message);
		}
			
		
		//console.log(JSON.stringify(message));
		if(message.isBoozer == true || message.path.length == 0)
			channel[message.type].call(channel, message);
		else
			client.carryHome(message);
			
	}

	var disconnectCallback = function() {
		//console.log('removing peer ' + peerID);
		client.pool.deleteConnectionByName(peerID);
		//console.log('Client ' + peerID + ' disconnected!');
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
		
		//console.log(pkt);
		console.log('channel is sending...');
		channel.wrappedChannel.send(pkt.toString());
	}

}

exports.Channel = window.Channel = Channel;
