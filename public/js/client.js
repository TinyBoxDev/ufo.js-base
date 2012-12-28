(function(exports){

var Client = function() {
	this.connectionPool = [];
}

Client.prototype.bootstrap = function() {
	this.setViewDuringBootstrap();
	var currentPeer = new Peer.Peer('http://p2pwebsharing.herokuapp.com');
	currentPeer.lookForAPeer(this.onBootstrapPerformed);
}

Client.prototype.setViewDuringBootstrap = null;

Client.prototype.onBootstrapPerformed = null;

	exports.Client = Client;

})(typeof exports === 'undefined'? this['Client']={}: exports);
