var peeringReplyPacket = function(currentAnswer) {
	this.answer = currentAnswer;	
}

if(typeof window === 'undefined')
	window = global;

exports.peeringReplyPacket = window.peeringReplyPacket = peeringReplyPacket;
