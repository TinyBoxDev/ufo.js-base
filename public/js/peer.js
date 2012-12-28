var Peer = function(bootstrapServerAddress) {
	var self = this;
	this.channel = new Channel();
	
	if(bootstrapServerAddress) {
		/* Step 2I of the peering process: take the answer received and instantiate a datachannel */
		var onPeeringReply = function(reply) {
			// TODO: allocate datachannel!
			self.peerConnection.setRemoteDescription(reply.answer);
			this.setChannel(self.peerConnection);
		}
		
		this.peerConnection = null;
		this.channel.on('peeringReply', onPeeringReply);
		this.channel.connectByName(bootstrapServerAddress);
	}
}

Peer.prototype.setSocketForPeer = function(socket) {
	this.channel.connectViaSocket(socket);
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
		var packet = new p2pPacket('peering', new peeringPacket(offer));
		self.peerConnection.setLocalDescription(offer);
		self.channel.send(packet);
	}
	

	this.peerConnection = new mozRTCPeerConnection();
	navigator.mozGetUserMedia({audio:true, fake:true}, onFakeStreamDone, generalFailureCallback);	
}

Peer.prototype.setPeeringCallback = function(peeringCallback) {
	this.channel.on('peering', peeringCallback);
}

var generalFailureCallback = function(errorMessage) {
	throw errorMessage
}
