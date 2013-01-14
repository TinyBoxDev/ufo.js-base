var Channel = require('./channel').Channel;
var p2pPacket = require('./p2pPacket').p2pPacket;
var peeringPacket = require('./peeringPacket').peeringPacket;
var peeringReplyPacket = require('./peeringReplyPacket').peeringReplyPacket;
var setIdPacket = require('./setIdPacket').setIdPacket;

var Peer = function(bootstrapServerAddress, onBootstrapPerformed) {
	console.log('Connecting peer with BSS...');
	var self = this;
	this.channel = new Channel();
	
	this.channel.on('setId', function(setIdPacket) {
		//console.log('Setting your id...');
		client.id = setIdPacket.body.id;
		self.lookForAPeer(function(retrievedPeerId) {
			client.pool.pushConnection(retrievedPeerId, self);
			self.channel.connectViaSocket(self.channel, retrievedPeerId);
			client.onBootstrapPerformed(); 
		});
		
	});
	
	this.channel.on('peering', function(peeringPacket) {
		client.onPeering(peeringPacket, self);
	});

	this.channel.on('echo', function(echoPacket) {
		client.onEchoMessage(echoPacket);
	});
	
	this.peerConnection = null;
	
	this.localPort = Math.round(Math.random() * (500)) + 5000;
	this.remotePort = null;

	if(bootstrapServerAddress)
		this.channel.connectByName(bootstrapServerAddress, onBootstrapPerformed);
}

Peer.prototype.setSocketForPeer = function(socket, id) {
	this.channel.connectViaSocket(socket, id);
	//console.log('for peer id: ' + id);
	if(id)
		this.channel.send(new p2pPacket('setId', new setIdPacket(id), false));
}

/*
Peer.prototype.sendPeeringReply = function(answer) {
	this.channel.send(new p2pPacket('peeringReply', new peeringReplyPacket(answer)));
}
*/

Peer.prototype.createSocketForPeer = function(peeringPkt, onConnected) {
	var self = this;
	
	var RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
	var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
	var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;

	var candidatesNumber = 0;

	// 3. once added the remote description
	var onRemoteDescriptionAdded = function() {
		self.peerConnection.createAnswer(onAnswerCreated, generalFailureCallback, {});		
	}

	// 4. once answer created
	var onAnswerCreated = function(answer) {
		self.peerConnection.setLocalDescription(answer);
	}

	// 1. create a peerconnection object
	this.peerConnection = new RTCPeerConnection( { iceServers: [ { url : "stun:stun.l.google.com:19302" } ] }, { optional: [ { RtpDataChannels: true } ] });
	//this.peerConnection = new RTCPeerConnection( null, { optional: [ { RtpDataChannels: true } ] });
	// 2. set the connection callback
	this.peerConnection.onicecandidate = function(event) {
		if (event.candidate && ++candidatesNumber==2) {
				var peeringReplyPkt = new peeringReplyPacket(client.id);
				var p2pPkt = new p2pPacket('peeringReply', peeringReplyPkt.fromAnswer(self.peerConnection.localDescription), false);
				console.log(self.peerConnection.localDescription.sdp);
				p2pPkt.path = peeringPkt.path;
				client.carryHome(p2pPkt);
		}
	}

	this.peerConnection.ondatachannel = function(event) {
		//console.log('new channel')
		var newDataChannel = event.channel;
		newDataChannel.onopen = function() {
			console.log('Answer open + ' + newDataChannel.label);
			self.channel.connectViaSocket(newDataChannel, peeringPkt.body.originator);
			onConnected();	
		};	
	}
	
	peeringPkt.body = new peeringPacket().fill(peeringPkt.body);
	this.peerConnection.setRemoteDescription(peeringPkt.body.toOffer(), onRemoteDescriptionAdded, generalFailureCallback);


}

Peer.prototype.lookForAPeer = function(onPeerFound) {
	var self = this;
	var retrievedPeerId = null;
	
	var RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
	var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
	var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;

	var candidatesNumber = 0;

	// 6. send the offer when ready
	var onOfferCreated = function(offer) {
		self.peerConnection.setLocalDescription(offer);
		//self.channel.send(new p2ddpPacket('peering', new peeringPacket(offer, client.id, self.localPort)));
	}

	// 7. inspect the reply and choose from datachannel or websocket
	var onPeeringReply = function(reply) {
	
		reply.body = new peeringReplyPacket().fill(reply.body);
		retrievedPeerId = reply.body.originator;

		if(reply.body.isAnswerPresent == true) {
			self.peerConnection.setRemoteDescription(new RTCSessionDescription(reply.body.toAnswer()));
		}
		else {
			onPeerFound(retrievedPeerId);
		}
		
		//self.peerconnection = null;

	}
	
	// 1. create a peerconnection object
	this.peerConnection = new RTCPeerConnection( { iceServers: [ { url : "stun:stun.l.google.com:19302" } ] }, { optional: [ { RtpDataChannels: true } ] });
	//this.peerConnection = new RTCPeerConnection( null, { optional: [ { RtpDataChannels: true } ] });
	// 2. set the connection callback
	this.peerConnection.onicecandidate = function(event) {
		if (event.candidate && ++candidatesNumber==4) {
				var peeringPkt = new peeringPacket(client.id);
				self.channel.send(new p2pPacket('peering', peeringPkt.fromOffer(self.peerConnection.localDescription), true));
				console.log(self.peerConnection.localDescription.sdp);
		}
	}
	
	
	// 3. create a temporany data channel
	var localDataChannel = this.peerConnection.createDataChannel('datachannel', { reliable : false, outOfOrderAllowed : true, maxRetransmitNum : 0 });
	// 4. set this data channel as peer channel when it connects
	localDataChannel.onopen = function() {
		console.log('Offer open + ' + localDataChannel.label);
		onPeerFound(retrievedPeerId);
    };

	this.channel.on('peeringReply', onPeeringReply);

	// 5. create an offer
	this.peerConnection.createOffer(onOfferCreated, generalFailureCallback, {});
}

Peer.prototype.send = function(packet) {
	this.channel.send(packet);	
}

var generalFailureCallback = function(errorMessage) {
	throw errorMessage
}

exports.Peer = window.Peer = Peer;
