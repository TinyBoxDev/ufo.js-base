var WebSocketServer = require('ws').Server
var Peer = require('peer').Peer;
var connectionPool = require('connectionPool').connectionPool;

var BSPeer = {
    pool : new connectionPool(),
    id : null,
    
    startServer : function(httpServer) {
	var wss = new WebSocketServer({server : httpServer});
	this.id = randomString(32, '#aA!');

	wss.on('connection', function(socket) {  
	    var thisPeer = new Peer();
	    var peerID = randomString(32, '#aA!');
	    thisPeer.setSocketForPeer(socket);
	    thisPeer.setPeerId(peerID);
	    
	    var peering = function(offer) {
		if(BSPeer.pool.usedConnections < BSPeer.pool.size) {
		    BSPeer.pool.pushConnection(peerID, thisPeer);
		    thisPeer.sendPeeringReply(null);
		    console.log('Client connected!');
		} else {
		    // TODO : forewarding request
		}
	    }

	    var disconnecting = function() {
		BSPeer.pool.deleteConnectionByName(peerID);
		console.log('Client disconnected!');
	    }
	    
	    thisPeer.channel.on('peering', peering);
	    thisPeer.channel.on('disconnect', disconnecting);
	    //thisPeer.channel.on('densify', densify);
	    
	});

	wss.on('disconnection', function(socket) {
	    console.log('Client disconnected outside connection contex!');
	});
    }
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

exports.bspeer = window.client = BSPeer;
