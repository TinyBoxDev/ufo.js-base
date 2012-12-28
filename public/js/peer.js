if(!Channel)
	var Channel = require('Channel').Channel;
else
	Channel = Channel.Channel;
if(!p2pPacket)
	var p2pPacket = require('p2pPacket');
if(!peeringPacket)
	var peeringPacket = require('p2pPacket');
if(!peeringReplyPacket) 
	var peeringReplyPacket = require('peeringReplyPacket');

(function(exports){
var Peer = function(bootstrapServerAddress) {
	var self = this;
	this.channel = new Channel();
	
	if(bootstrapServerAddress) {
		/* Step 2I of the peering process: take the answer received and instantiate a datachannel */
		var onPeeringReply = function(reply) {
			self.peerConnection.setRemoteDescription(reply.answer, connectToPeer);
		}

		/* Step 3I of the peering process: connect to peer */
		var connectToPeer = function() {
			self.peerConnection.connectDataConnection(5000,5001);
		}		
		
		this.peerConnection = null;
		this.channel.on('peeringReply', onPeeringReply);
		this.channel.connectByName(bootstrapServerAddress);
	}
}

Peer.prototype.setSocketForPeer = function(socket) {
	this.channel.connectViaSocket(socket);
}

Peer.prototype.sendPeeringReply = function(answer) {
	this.channel.send(new p2pPacket.p2pPacket('peeringReply', new peeringReplyPacket.peeringReplyPacket(answer)));
}

Peer.prototype.lookForAPeer = function() {
	var self = this;

	/* Step 0I of the peering process: set a fake audio stream */
	var onFakeStreamDone = function(stream) {
		self.peerConnection.addStream(stream);
		self.peerConnection.createOffer(onOfferCreated, generalFailureCallback);
	}

	/* Step 1I of the peering process: prepare an offer and send it to the bootstrap server */
	var onOfferCreated = function(offer) {
		var packet = new p2pPacket.p2pPacket('peering', new peeringPacket.peeringPacket(offer));
		self.peerConnection.setLocalDescription(offer);
		self.channel.send(packet);
	}
	

	this.peerConnection = new mozRTCPeerConnection();

	/* Step 4I of the peering process: save data channel as new wrapped channel */
	this.peerConnection.onconnection = function() {
		console.log('onconnection');
		self.channel.connectViaSocket(self.peerConnection.createDataChannel("Reliable data channel :)",{}));
	}

	navigator.mozGetUserMedia({audio:true, fake:true}, onFakeStreamDone, generalFailureCallback);	
}

Peer.prototype.setPeeringCallback = function(peeringCallback) {
	this.channel.on('peering', peeringCallback);
}

var generalFailureCallback = function(errorMessage) {
	throw errorMessage
}

   exports.Peer = Peer;

})(typeof exports === 'undefined'? this['Peer']={}: exports);
