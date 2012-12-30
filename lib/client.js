var Peer = require('./peer').Peer;

var Client = function() {
	this.connectionPool = [];
}

Client.prototype.bootstrap = function() {
	this.setViewDuringBootstrap();
	var currentPeer = new Peer('http://p2pwebsharing.herokuapp.com');
	currentPeer.lookForAPeer(this.onBootstrapPerformed);
}

Client.prototype.setViewDuringBootstrap = null;

Client.prototype.onBootstrapPerformed = null;

if(typeof window === 'undefined')
	window = global;

exports.Client = window.Client = Client;
