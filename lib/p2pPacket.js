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

exports.p2pPacket = window.p2pPacket = p2pPacket;
