var peeringPacket = function(currentOffer, from, port) {
	this.offer = currentOffer;
	this.originator = from;
	this.port = port;
}


exports.peeringPacket = window.peeringPacket = peeringPacket;
