(function(exports){

var p2pPacket = function(currentType, currentBody) {
	this.type = currentType;
	this.body = currentBody;
}



   exports.p2pPacket = p2pPacket;

})(typeof exports === 'undefined'? this['p2pPacket']={}: exports);
