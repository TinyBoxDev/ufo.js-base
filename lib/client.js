var Peer = require('./peer').Peer;

var Client = {

	connectionPool : [],
	
	id : null,

	bootstrap : function() {
		var self = this;

		var onBSSReady = function() {
			currentPeer.lookForAPeer(self.onPeerFound);
			console.log('BSS Ready');
		}

		var currentPeer = new Peer('ws://p2pwebsharing.dyndns.biz', onBSSReady);
	},

	onPeerFound : function() {
		console.log('new peer found!');
	}


}

exports.client = window.client = Client;
