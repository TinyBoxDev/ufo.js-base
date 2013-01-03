var WebSocketServer = require('ws').Server
var Peer = require('peer').Peer;
var connectionPool = require('connectionPool').connectionPool;

var BSPeer = function() {
    this.pool = new connectionPool();
    console.log('Connection pool size: ' + this.pool.size);
    console.log('Connection pool used: ' + this.pool.usedConnections);
}

var randomString = function(length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:;\<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
    return result;
}

BSPeer.prototype.startServer = function(httpServer) {
    
    var self = this;
    var wss = new WebSocketServer({server : httpServer});

    wss.on('connection', function(socket) {
	socket.on('message', function(message, flags) {
	    message = JSON.parse(message);
	    if(message.type)
		self[message.type].call(self, message, socket);
	});
    });

}

BSPeer.prototype.peering = function(offer, socket) {
    if(this.pool.usedConnections < this.pool.size) {
	console.log('Available space in pool: ' + (this.pool.size - this.pool.usedConnections) + ' out of ' + this.pool.size + ' connections available.');
	var thisPeer = new Peer();
	thisPeer.setSocketForPeer(socket);
	var socketID = randomString(32, '#aA!');
	this.pool.pushConnection(socketID, thisPeer);
	thisPeer.sendPeeringReply(null);
	console.log('Added connection ' + socketID);
	console.log('Remaining space: ' + (this.pool.size - this.pool.usedConnections) + ' out of ' + this.pool.size);
    } else {
	console.log('Pool is full. Please disconnect.');
    }
}

exports.BSPeer = BSPeer;
