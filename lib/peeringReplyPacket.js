var peeringReplyPacket = function(currentAnswer, from) {
	this.answer = currentAnswer;	
	this.originator = from;
}

exports.peeringReplyPacket = window.peeringReplyPacket = peeringReplyPacket;
