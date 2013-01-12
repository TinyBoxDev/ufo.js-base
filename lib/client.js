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
		if((this.pool.usedConnections < this.pool.size) && !this.pool.exists(receivedPeeringPacket.body.originator)) {
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

	onEchoMessage : function(echoPacket) {
		//if(echoPacket.path.indexOf(client.id == -1)) {
			console.msg(echoPacket.body);
		//	var peersIdArray = this.pool.getIds();
		//	for(index = 0; index<this.pool.usedConnections; index++)
		//		if(echoPacket.path.indexOf(peersIdArray[index]) == -1)
		//			this.pool[index].send(echoPacket);
		//}
	},

	onPeerFound : function() {
		console.log('new peer found!');
	},
	
	carryHome : function(message) {
		console.log('babidi');
		this.pool[message.path.pop()].send(message);
	}


}

exports.client = window.client = Client;
