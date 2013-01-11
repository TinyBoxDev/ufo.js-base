var peeringPacket = function(currentOffer, iceCandidates, from, port) {
	this.offer = currentOffer;
	this.candidates = iceCandidates;
	this.originator = from;
	this.port = port;
}


exports.peeringPacket = window.peeringPacket = peeringPacket;
