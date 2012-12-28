var p2pPacket = function(currentType, currentBody) {
	this.type = currentType;
	this.body = currentBody;
}


if(typeof exports != 'undefined')
	exports.p2pPacket = p2pPacket;
