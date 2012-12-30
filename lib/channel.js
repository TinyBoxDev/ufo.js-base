if(typeof window === 'undefined')
	window = global; // write once run everywhere

var io = window.io || require('socket.io');

var Channel = function() {
	this.wrappedChannel = null;
}

Channel.prototype.send = null;

Channel.prototype.connectByName = function(serverAddress, onConnect) {
	var self = this;
	this.wrappedChannel = io.connect(serverAddress, {'force new connection' : true});
	this.wrappedChannel.on('connect', onConnect);
	configureSocketIoSocket(this);
}

Channel.prototype.connectViaSocket = function(peerSocket) {
	var self = this;
	if(peerSocket instanceof io.Socket || peerSocket.socket instanceof io.Socket) {
		this.wrappedChannel = peerSocket;				
		configureSocketIoSocket(this);
	}
	else if(peerSocket instanceof DataChannel) {
		this.wrappedChannel = peerSocket;
		this.send = this.wrappedChannel.send;
	}
		
}

Channel.prototype.on = function(eventName, callback) {
	this[eventName] = callback;
}

var configureSocketIoSocket = function(channel) {
	channel.wrappedChannel.on('p2pws', function(pkt) { 
		if(pkt.type && pkt.body)
			channel[pkt.type].call(channel, pkt.body);
	});

	channel.send = function(packet) {
		this.wrappedChannel.emit('p2pws', packet);
	}

}

exports.Channel = window.Channel = Channel;
