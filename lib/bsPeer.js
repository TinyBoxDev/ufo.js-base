var WebSocketServer = require('ws').Server
var Peer = require('peer').Peer;
var connectionPool = require('connectionPool').connectionPool;

var BSPeer = {
    pool : new connectionPool(),
    pretenders : new connectionPool(999),
    id : null,
    
    startServer : function(httpServer) {
		var wss = new WebSocketServer({server : httpServer});
		this.id = randomString(16, '#aA');

		wss.on('connection', function(socket) {
			//console.log('connected');
	    	var thisPeer = new Peer();
		    var peerID = randomString(16, '#aA');
		    //console.log('id to assign ' + peerID);
		    thisPeer.setSocketForPeer(socket, peerID);
		});
    },
	
	onPeering : function(receivedPeeringPacket, callingPeer) {
		if((this.pool.usedConnections < this.pool.size) && !this.pool.exists(receivedPeeringPacket.body.originator) && receivedPeeringPacket.path.length == 1) {
		    console.log('Pushing...');
		    this.pool.pushConnection(receivedPeeringPacket.body.originator, callingPeer);
		    //callingPeer.sendPeeringReply(null);
		    callingPeer.send(new p2pPacket('peeringReply', new peeringReplyPacket(this.id), false));
		} else {
			this.pretenders.pushConnection(receivedPeeringPacket.body.originator, callingPeer);
			var selected = parseInt(Math.random()*this.pool.size);
			console.log('sending to ' + selected);
			this.pool[this.pool[selected]].send(receivedPeeringPacket);
			/*
			do {
				var selected = parseInt(Math.random()*peersIdArray.length);
				selectedPeerId = peersIdArray[selected];
				peersIdArray.splice(selected, 1);
			} while(receivedPeeringPacket.path.indexOf(selectedPeerId) != -1 && peersIdArray.length > 0);
			
			if(peersIdArray.length > 0)
				this.pool[selectedPeerId].send(receivedPeeringPacket);
			else
				this.pool[pool.usedConnections-1].send(receivedPeeringPacket);
			*/
		}
	},
	
	onPeeringReply : function(receivedPeeringReplyPacket, callingPeer) {
		console.log('peering reply received');
	},

	onEchoMessage : function(echoPacket) {
		console.log(echoPacket.body);
	},
	
	carryHome : function(message) {
		var destination = message.path.pop();
		
		if(this.pretenders[destination]) 
			this.pretenders[destination].send(message);
		else if(this.pool[destination])
			this.pool[destination].send(message);
		else
			console.log('Where the fuck is ' + destination);
	}	
}

var randomString = function(length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:;\?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
    return result;
}

exports.bspeer = window.client = BSPeer;
