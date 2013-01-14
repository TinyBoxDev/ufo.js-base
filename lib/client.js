var connectionPool = require('./connectionPool').connectionPool;
var Peer = require('./peer').Peer;

var Client = {

	pool : new connectionPool(),
	
	id : null,

	disconnect : function() {
		var self = this;
		this.pool.getIds().forEach(function(peerID) {
			self.pool[peerID].channel.wrappedChannel.close();
		});
	},
	
	densify : function() {
		if(this.pool.usedConnections < 3) {
			var selected = parseInt(Math.random()*this.pool.usedConnections);
			var peerToInsert = new Peer();
			peerToInsert.findSomeoneElse(this.pool[this.pool[selected]], function(socket, retrievedPeerId) {
				client.pool.pushConnection(retrievedPeerId, peerToInsert);
				if(socket)
					peerToInsert.channel.connectViaSocket(socket, retrievedPeerId);
				client.onDensifyPerformed();
			});
		}
	},

	bootstrap : function() {
		var self = this;

		var onBSSReady = function() {
			//console.log('BSS is ready.');
		}

		var currentPeer = new Peer('ws://p2pwebsharing.dyndns.biz', onBSSReady);
	},

	onPeering : function(receivedPeeringPacket, callingPeer) {
		//console.log('Peering req received');
		var self = this;
		if((client.pool.usedConnections < client.pool.size) && !client.pool.exists(receivedPeeringPacket.body.originator)) {
			var onConnectionPerformed = function() {
				console.log('Connection performed.');
				client.pool.pushConnection(receivedPeeringPacket.body.originator, acceptedPeer);
			}
			var acceptedPeer = new Peer();
			//console.log('New peer created...');
			acceptedPeer.createSocketForPeer(receivedPeeringPacket, onConnectionPerformed);
		}
		
		else {
			console.log('Redirecting peering request...');
			var peersIdArray = this.pool.getIds();
			var selectedPeerId = null;
			
			do {
				var selected = parseInt(Math.random()*peersIdArray.length);
				selectedPeerId = peersIdArray[selected];
				peersIdArray.splice(selected, 1);
			} while(receivedPeeringPacket.path.indexOf(selectedPeerId) != -1 && peersIdArray.length > 0);

			if(peersIdArray.length > 0) {
				console.log('sending to ' + client.pool[selectedPeerId]);
				client.pool[selectedPeerId].send(receivedPeeringPacket);
			} else {
				console.log('sending back');
				callingPeer.send(receivedPeeringPacket);
			}
				
		}
		
	},

	onEchoMessage : function(echoPacket) {
		//if(echoPacket.path.indexOf(client.id == -1)) {
			console.msg('Rec:' + echoPacket.body);
		//	var peersIdArray = this.pool.getIds();
		//	for(index = 0; index<this.pool.usedConnections; index++)
		//		if(echoPacket.path.indexOf(peersIdArray[index]) == -1)
		//			this.pool[index].send(echoPacket);
		//}
	},

	onBootstrapPerformed : function() {
		//console.log('new peer found!');
	},

	onDensifyPerformed : function() {
		console.log('Rete addensata!');
	},
	
	carryHome : function(message) {
		//console.log('babidi');
		this.pool[message.path.pop()].send(message);
	}


}

exports.client = window.client = Client;
