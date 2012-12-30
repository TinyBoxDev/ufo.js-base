var peeringPacket = function(currentOffer) {
	this.offer = currentOffer;	
}


if(typeof window === 'undefined')
	window = global;

exports.peeringPacket = window.peeringPacket = peeringPacket;
