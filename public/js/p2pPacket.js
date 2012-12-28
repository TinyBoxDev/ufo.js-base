(function(exports){

var p2pPacket = function(currentType, currentBody, currentPath) {
	this.type = currentType;
	this.body = currentBody;
	this.path = currentPath;
}



   exports.p2pPacket = p2pPacket;

})(typeof exports === 'undefined'? this['p2pPacket']={}: exports);
