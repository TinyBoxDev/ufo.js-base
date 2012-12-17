var socketIO = require('socket.io');

var startPeer = function(httpServer) {
	io = socketIO.listen(httpServer);
	io.configure(function() {
		io.set("transports", ["xhr-polling"]);
		io.set("polling-duration", 10);
	});
}

exports.startPeer = startPeer;