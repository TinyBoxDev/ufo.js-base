var peeringReplyPacket = function(currentAnswer, iceCandidates, from, port) {
	this.answer = currentAnswer;
	this.originator = from;
	this.candidates = iceCandidates;
	this.port = port;
}

exports.peeringReplyPacket = window.peeringReplyPacket = peeringReplyPacket;
