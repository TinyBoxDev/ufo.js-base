var Peer = require('./peer').Peer;

var Client = {

	connectionPool : [],

	bootstrap : function() {
		var self = this;

		var onBSSReady = function() {
			currentPeer.lookForAPeer(self.onPeerFound);
			console.log('BSS Ready');
		}

		var currentPeer = new Peer('http://p2pwebsharing.dyndns.biz:8080', onBSSReady);
	},

	onPeerFound : function() {
		console.log('new peer found!');
	}


}

exports.client = window.client = Client;
