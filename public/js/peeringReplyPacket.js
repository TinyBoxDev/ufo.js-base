(function(exports){

var peeringReplyPacket = function(currentAnswer) {
	this.answer = currentAnswer;	
}

   exports.peeringReplyPacket = peeringReplyPacket;

})(typeof exports === 'undefined'? this['peeringReplyPacket']={}: exports);
