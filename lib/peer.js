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
		self.lookForAPeer(client.onPeerFound);
		console.log(client.id);
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

Peer.prototype.createSocketForPeer = function(peeringPkt, callingPeer, onConnected) {
	var self = this;
	
	var RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
	var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
	var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;

	var candidatesArray = [];

	// 3. once added the remote description
	var onRemoteDescriptionAdded = function() {
		//peeringPacket.body.candidates.forEach(function(candidate){
		//	self.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  		//});
			
		self.peerConnection.createAnswer(onAnswerCreated, generalFailureCallback, {});		
	}

	// 4. once answer created
	var onAnswerCreated = function(answer) {
		self.peerConnection.setLocalDescription(answer);
	}

	// 1. create a peerconnection object
	this.peerConnection = new RTCPeerConnection( { iceServers: [ { url : "stun:stun.l.google.com:19302" } ] }, { optional: [ { RtpDataChannels: true } ] });
	// 2. set the connection callback
	this.peerConnection.onicecandidate = function(event) {
		if (event.candidate) {
			candidatesArray.push(event.candidate);
			if (candidatesArray.length == 2) {
				var pkt = new p2pPacket('peeringReply',
							new peeringReplyPacket(self.peerConnection.localDescription, candidatesArray, client.id, self.localPort), false);
				pkt.path = peeringPkt.path;
				client.carryHome(pkt);
			}
		}
	}

	this.peerConnection.ondatachannel = function(event) {
		//console.log('new channel')
		var newDataChannel = event.channel;
		newDataChannel.onopen = function() {
			//console.log('Datachannel open');
			self.channel.connectViaSocket(newDataChannel, peeringPkt.body.originator);
			onConnected();	
		};	
	}

	//var offerAsByteArray = peeringPacket.body.offer;
	//var offer = '';
	//for(index=0; index<offerAsByteArray.length; index++)
	//	offer += String.fromCharCode(offerAsByteArray[index]);
	
	//this.peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(offer)), onRemoteDescriptionAdded, generalFailureCallback);
	
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
		retrievedPeerId = reply.body.originator;

		if(reply.body.answer) {
			self.peerConnection.setRemoteDescription(new RTCSessionDescription(reply.body.answer));

			reply.body.candidates.forEach(function(candidate){
				console.log(candidate);
				self.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  			});

		}
		else {
			client.pool.pushConnection(reply.body.originator, self);
			//self.channel.connectViaSocket(this, reply.body.originator);
			onPeerFound();
		}
		
		self.peerconnection = null;

	}
	
	// 1. create a peerconnection object
	this.peerConnection = new RTCPeerConnection( { iceServers: [ { url : "stun:stun.l.google.com:19302" } ] }, { optional: [ { RtpDataChannels: true } ] });
	// 2. set the connection callback
	this.peerConnection.onicecandidate = function(event) {
		if (event.candidate && ++candidatesNumber==4) {
				var peeringPkt = new peeringPacket(client.id);
				self.channel.send(new p2pPacket('peering', peeringPkt.fromOffer(self.peerConnection.localDescription), true));
		}
	}
	
	
	// 3. create a temporany data channel
	var localDataChannel = this.peerConnection.createDataChannel('datachannel', { reliable : false, outOfOrderAllowed : true, maxRetransmitNum : 0 });
	// 4. set this data channel as peer channel when it connects
	localDataChannel.onopen = function() {
		//console.log('Datachannel open');
		client.pool.pushConnection(retrievedPeerId, self);
		self.channel.connectViaSocket(this, retrievedPeerId);
		onPeerFound();
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
