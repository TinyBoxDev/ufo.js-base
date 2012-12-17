var socketIO = require('socket.io');
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
		socket.on('peering', function(peeringPackage) {
			console.log(peeringPackage);
			if(peeringPackage = 'caccolone') {
				socket.emit('reply', 'megacaccole');
			}
		});
		//---------------------------------------------
	});
}

exports.startPeer = startPeer;