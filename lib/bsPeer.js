var socketIO = require('socket.io');
var peer = require('peer').Peer;
var connectionPool = [];
var MAX_CONNECTION_POOL_SIZE = 4;

var startPeer = function(httpServer) {
	io = socketIO.listen(httpServer);
	io.configure(function() {
		io.set("transports", ["xhr-polling"]);
		io.set("polling-duration", 10);
	});
	io.sockets.on('connection', function (socket) {
		
		//---------------------------------------------
		// An outer peer is asking for connectivity.
		// Request json package has the form: { offer : data }
		//---------------------------------------------
		socket.on('peering', function(peeringPackage) {
			if(connectionPool.length == MAX_CONNECTION_POOL_SIZE) {
				console.log('BSS pool is out of space: dropping on the tree request for ' + socket.id);
				connectionRequire = { requiredBy : socket.id, offer : peeringPackage.offer }
				socket.emit('requirePeering', connectionRequire);
			} else {
				console.log('BSS pool ia available');
				connectionPool.push(socket);
				var connectionGranting = { answer : null, myName : socket.id }
				socket.emit('grantPeering', connectionGranting);
			}
		});
		//---------------------------------------------
	});
}

exports.startPeer = startPeer;