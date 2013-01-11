var connectionPool = require('./connectionPool').connectionPool;
var Peer = require('./peer').Peer;

var Client = {

	pool : new connectionPool(),
	
	id : null,

	bootstrap : function() {
		var self = this;

		var onBSSReady = function() {
			console.log('BSS is ready.');
		}

		var currentPeer = new Peer('ws://p2pwebsharing.dyndns.biz', onBSSReady);
	},

	onPeering : function(receivedPeeringPacket, callingPeer) {
	console.log('Peering req received');
		var self = this;
		console.log(this.pool.usedConnections < this.pool.size);
		console.log(!this.pool.exists(receivedPeeringPacket.body.originator));
		console.log(receivedPeeringPacket.path.length == 1);
		if((this.pool.usedConnections < this.pool.size) && !this.pool.exists(receivedPeeringPacket.body.originator) && receivedPeeringPacket.path.length == 1) {
			var onConnectionPerformed = function() {
				console.log('Connection performed...');
				self.pool.pushConnection(receivedPeeringPacket.body.originator, acceptedPeer);				
			}
			var acceptedPeer = new Peer();
			console.log('New peer created...');
			acceptedPeer.createSocketForPeer(receivedPeeringPacket, callingPeer, onConnectionPerformed);
		}
		
		else {
			console.log('Redirecting peering request...');
			/*
			var peersIdArray = this.pool.getIds();
			var selectedPeerId = null;
			do {
				var selected = parseInt(Math.random()*peersIdArray.length);
				selectedPeerId = peersIdArray[selected];
				peersIdArray.splice(selected, 1);
			} while(receivedPeeringPacket.path.indexOf(selectedPeerId) != -1 && peersIdArray.length > 0);
			
			if(peersIdArray.length > 0)
				this.pool[selectedPeerId].send(receivedPeeringPacket);
			else
				callingPeer.send(receivedPeeringPacket);
				*/
		}
		
	},

	onPeerFound : function() {
		console.log('new peer found!');
	},
	
	carryHome : function(message) {
		this.pool[message.path.pop()].send(message);
	}


}

exports.client = window.client = Client;
