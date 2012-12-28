var socketIO = require('socket.io');
var Peer = require('peer').Peer;
var MAX_CONNECTION_POOL_SIZE = 4;

var BSPeer = function() {
    this.connectionPool = [];
}

BSPeer.prototype.startServer = function(httpServer) {
    
    var self = this;
    
    var io = socketIO.listen(httpServer);
    io.configure(function() {
	io.set("transports", ["xhr-polling"]);
	io.set("polling-duration", 10);
    });

    io.sockets.on('connection', function (socket) {
	socket.on('p2pws', function(data) {
	    if(data.type)
		self[data.type].call(self, data, socket);
	});
    });

}

BSPeer.prototype.peering = function(offer, socket) {
    if(this.connectionPool.length < MAX_CONNECTION_POOL_SIZE) {
	var thisPeer = new Peer();
	thisPeer.setSocketForPeer(socket);
	this.connectionPool.push(thisPeer);
	thisPeer.sendPeeringReply(null);
    }
}

exports.BSPeer = BSPeer;
