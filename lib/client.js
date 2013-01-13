var connectionPool = require('./connectionPool').connectionPool;
var Peer = require('./peer').Peer;

var Client = {

	pool : new connectionPool(2),
	
	id : null,

	bootstrap : function() {
		var self = this;

		var onBSSReady = function() {
			//console.log('BSS is ready.');
		}
		
		window.onbeforeunload = function(event) {
			this.pool.getIds().forEach(function(peerID) {
				self.pool[peerID].channel.wrappedChannel.close();
			});
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
			acceptedPeer.createSocketForPeer(receivedPeeringPacket, callingPeer, onConnectionPerformed);
		}
		
		else {
			console.log('Redirecting peering request...');
			var offer = new RTCSessionDescription(receivedPeeringPacket.body.offer);
			var pkt = new p2pPacket('peering', 
					new peeringPacket(offer, receivedPeeringPacket.body.candidates, receivedPeeringPacket.body.originator, null));
			pkt.path = receivedPeeringPacket.path;
			client.pool[client.pool[1]].send(pkt);
			//var peersIdArray = this.pool.getIds();
			//var selectedPeerId = null;
			
			//do {
			//	var selected = parseInt(Math.random()*peersIdArray.length);
			//	selectedPeerId = peersIdArray[selected];
			//	peersIdArray.splice(selected, 1);
			//} while(receivedPeeringPacket.path.indexOf(selectedPeerId) != -1 && peersIdArray.length > 0);
			
			//console.log('Here we are!! Selected peer is ' + JSON.stringify(selectedPeerId));
			//console.log('sending to '+selectedPeerId);
			//console.log(self.pool[selectedPeerId]);

			//if(peersIdArray.length > 0) {
			//	console.log('sending to ' + client.pool[1]);
			//	//console.log('sending to someone INSIDE the pool');
			//	this.pool[selectedPeerId].send(new p2pPacket('echo', 'come sei TUTTO', false));
			//	
			//	console.log('sto per mandare questa merda');
			//	var stoCazzoDiPacchetto = new p2pPacket('peering', receivedPeeringPacket.body, true);
			//	stoCazzoDiPacchetto.path = receivedPeeringPacket.path;
			//	//console.log(stoCazzoDiPacchetto);
			//	
			//	this.pool[selectedPeerId].send(stoCazzoDiPacchetto);
			//	client.pool[client.pool[1]].send(receivedPeeringPacket);
			//	client.pool[selectedPeerId].send(new p2pPacket('echo', receivedPeeringPacket, true));
			//} else {
			//	//console.log('resending back to transmitter');
			//	console.log('sending back');
			//	callingPeer.send(receivedPeeringPacket);
			//}
				
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
		//console.log('new peer found!');
	},
	
	carryHome : function(message) {
		//console.log('babidi');
		this.pool[message.path.pop()].send(message);
	}


}

exports.client = window.client = Client;
