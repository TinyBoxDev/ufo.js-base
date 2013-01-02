var WebSocketServer = require('ws').Server
var Peer = require('peer').Peer;
var MAX_CONNECTION_POOL_SIZE = 4;

var BSPeer = function() {
    this.connectionPool = [];
}

BSPeer.prototype.startServer = function() {
    
    var self = this;
    var wss = new WebSocketServer({port : 8080});
    

    wss.on('connection', function(socket) {
	socket.on('message', function(message, flags) {
	    message = JSON.parse(message);
	    if(message.type)
		self[message.type].call(self, message, socket);
	});
    });

}

BSPeer.prototype.peering = function(offer, socket) {
    if(this.connectionPool.length < MAX_CONNECTION_POOL_SIZE) {
	console.log('Available space in pool: ' + this.connectionPool.length + ' connections out of ' + MAX_CONNECTION_POOL_SIZE + ' used.');
	var thisPeer = new Peer();
	thisPeer.setSocketForPeer(socket);
	this.connectionPool.push(thisPeer);
	thisPeer.sendPeeringReply(null);
    } else {
	console.log('Pool is full. Please disconnect.');
    }
}

exports.BSPeer = BSPeer;
