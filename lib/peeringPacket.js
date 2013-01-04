var peeringPacket = function(currentOffer, from) {
	this.offer = currentOffer;
	this.originator = from;
}


exports.peeringPacket = window.peeringPacket = peeringPacket;
