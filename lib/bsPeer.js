//var socketIO = require('socket.io');
var WebSocketServer = require('ws').Server
var Peer = require('peer').Peer;
var MAX_CONNECTION_POOL_SIZE = 4;

var BSPeer = function() {
    this.connectionPool = [];
}

BSPeer.prototype.startServer = function(httpServer) {
    
    var self = this;
    var wss = new WebSocketServer({port : 5000});
    

    wss.on('connection', function(socket) {
	console.log('Connected' + socket);
	socket.on('message', function(message) {
	    console.log('Received: ' + message);
	    if(message.type)
		self[message.type].call(self, message, socket);
	});
    });
    
    //var io = socketIO.listen(httpServer);
    //io.configure(function() {
//		io.set("transports", ["websocket"]);
		//io.set("polling-duration", 10);
  //  });

    //io.sockets.on('connection', function (socket) {
//		socket.on('p2pws', function(data) {
//	    	if(data.type)
//				self[data.type].call(self, data, socket);
//		});
  //  });

}

BSPeer.prototype.peering = function(offer, socket) {
    if(this.connectionPool.length < MAX_CONNECTION_POOL_SIZE) {
	console.log('Available space in pool: ' + this.connectionPool.length + ' connections out of ' + MAX_CONNECTION_POOL_SIZE + ' used.');
	console.log('Offer received: ' + offer);
		var thisPeer = new Peer();
		thisPeer.setSocketForPeer(socket);
		this.connectionPool.push(thisPeer);
		thisPeer.sendPeeringReply(null);
    } else {
	console.log('Pool is full. Please disconnect.');
		for(var index = 0; index < this.connectionPool.length; index++) {
		    //connectionPool[index].forewardPeeringRequest(offer);
		}
    }
}

exports.BSPeer = BSPeer;
