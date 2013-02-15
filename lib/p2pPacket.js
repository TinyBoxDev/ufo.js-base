var p2pPacket = function(currentType, currentBody, booze) {
	this.type = currentType;
	this.body = currentBody;
	this.path = []; 
	this.isBoozer = booze;	
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

p2pPacket.prototype.toBlob = function() {
	return new Blob([JSON.stringify(this)]);
}

p2pPacket.prototype.fromArrayBuffer = function(buffer) {
	var asString = String.fromCharCode.apply(null, new Int8Array(buffer));
	return this.fromString();
}

p2pPacket.prototype.toArrayBuffer = function() {
	var asString = JSON.stringify(this);
	var buffer = new ArrayBuffer(asString.length); // 2 bytes for each char
	var bufView = new Int8Array(buffer);
	for (var i=0; i<asString.length; i++)
		bufView[i] = asString.charCodeAt(i);
	
	return buffer;
}

p2pPacket.prototype.fromString = function(packet) {
	packet = JSON.parse(packet);
	this.type = packet.type;
	this.body = packet.body;
	this.path = packet.path;
	this.isBoozer = packet.isBoozer;
	
	return this;
}

exports.p2pPacket = window.p2pPacket = p2pPacket;