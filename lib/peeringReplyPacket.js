var peeringReplyPacket = function(currentAnswer, from, port) {
	this.answer = currentAnswer;	
	this.originator = from;
	this.port = port;
}

exports.peeringReplyPacket = window.peeringReplyPacket = peeringReplyPacket;
