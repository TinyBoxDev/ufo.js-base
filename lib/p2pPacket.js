var p2pPacket = function(currentType, currentBody) {
	this.type = currentType;
	this.body = currentBody;
	this.path = [];
	
}

p2pPacket.prototype.addIDToPath = function(id) {
    this.path.push(id);
}

p2pPacket.prototype.removeIDFromPath = function() {
    this.path.pop();
}

p2pPacket.prototype.toString = function() {
	return JSON.stringify(this);
}

p2pPacket.prototype.compile = function(packet) {
	packet = JSON.parse(packet);
	this.type = packet.type;
	this.body = packet.body;
	this.path = packet.path;

	return this;
}

exports.p2pPacket = window.p2pPacket = p2pPacket;
