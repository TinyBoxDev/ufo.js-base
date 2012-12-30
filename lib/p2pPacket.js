var p2pPacket = function(currentType, currentBody, currentPath) {
	this.type = currentType;
	this.body = currentBody;
	this.path = currentPath;
}

if(typeof window === 'undefined')
	window = global;

exports.p2pPacket = window.p2pPacket = p2pPacket;
