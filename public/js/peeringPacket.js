(function(exports){

var peeringPacket = function(currentOffer) {
	this.offer = currentOffer;	
}

   exports.peeringPacket = peeringPacket;

})(typeof exports === 'undefined'? this['peeringPacket']={}: exports);
