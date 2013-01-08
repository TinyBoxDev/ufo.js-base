var connectionPool = require('./connectionPool').connectionPool;
var Peer = require('./peer').Peer;

var Client = {

	pool : new connectionPool(),
	
	id : null,

	bootstrap : function() {
		var self = this;

		var onBSSReady = function() {
			currentPeer.lookForAPeer(self.onPeerFound);
			console.log('BSS Ready');
		}

		var currentPeer = new Peer('ws://p2pwebsharing.dyndns.biz', onBSSReady);
	},

	onPeering : function(receivedPeeringPacket, callingPeer) {
		var self = this;
		if((this.pool.usedConnections < this.pool.size) && !this.pool.exists(receivedPeeringPacket.body.originator) && receivedPeeringPacket.path.length == 1) {
			var onConnectionPerformed = function() {
				self.pool.pushConnection(receivedPeeringPacket.body.originator, acceptedPeer);				
			}

			var acceptedPeer = new Peer();
			acceptedPeer.createSocketForPeer(receivedPeeringPacket, callingPeer, onConnectionPerformed);
		}
	},

	onPeerFound : function() {
		console.log('new peer found!');
	}


}

exports.client = window.client = Client;
