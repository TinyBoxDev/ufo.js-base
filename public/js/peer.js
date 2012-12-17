var bootstrapSocket = null;

var connectToBootstrapServer = function() {
	bootstrapSocket = io.connect('http://p2pwebsharing.herokuapp.com');
	bootstrapSocket.on('reply', onReply);
}

var onReply = function(data) {
	console.log(data);
}

var requestForSupernode = function() {
	bootstrapSocket.emit('peering', 'caccolone');
}
