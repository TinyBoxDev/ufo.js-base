var Channel = require('./channel').Channel;
var p2pPacket = require('./p2pPacket').p2pPacket;
var peeringPacket = require('./peeringPacket').peeringPacket;
var peeringReplyPacket = require('./peeringReplyPacket').peeringReplyPacket;
var setIdPacket = require('./setIdPacket').setIdPacket;
 
var Peer = function(bootstrapServerAddress, onBootstrapPerformed) {
  
  if(window.mozRTCPeerConnection) {
    console.log('Detected a usable mozilla version');
    this.findFirstPeer = mozFindFirstPeer;
    this.findSomeoneElse = mozFindSomeoneElse;
    this.createSocketForPeer = mozCreateSocketForPeer;    
  } else if(window.webkitRTCPeerConnection) {
    console.log('Detected a usable chrome version');
    this.findFirstPeer = chromeFindFirstPeer;
    this.findSomeoneElse = chromeFindSomeoneElse;
    this.createSocketForPeer = chromeCreateSocketForPeer;
  }
  else {
    console.log('Fuck you bitch!');
  }
  
  console.log('Connecting peer with BSS...');
  	var self = this;
  	this.channel = new Channel();

  	this.channel.on('peering', function(peeringPacket) {
  		client.onPeering(peeringPacket, self);
  	});

  	this.channel.on('echo', function(echoPacket) {
  		client.onEchoMessage(echoPacket);
  	});

  	this.peerConnection = null;

  	//this.localPort = Math.round(Math.random() * (500)) + 5000;
	//this.remotePort = null;

  	if(bootstrapServerAddress) {
  		this.channel.connectByName(bootstrapServerAddress, function() {
  			self.findFirstPeer(function(socket, retrievedPeerId) {
				console.log('callback');
  				client.pool.pushConnection(retrievedPeerId, self);
  				if(socket)
  					self.channel.connectViaSocket(socket, retrievedPeerId);
  				client.onBootstrapPerformed();
  			});
  		});
  	}
}
 
Peer.prototype.send = function(packet) {
        this.channel.send(packet);
}
 
Peer.prototype.findFirstPeer = null;
 
Peer.prototype.findSomeoneElse = null;
 
Peer.prototype.createSocketForPeer = null;
 
Peer.prototype.setSocketForPeer = function(socket, id) {
        this.channel.connectViaSocket(socket, id);
        //console.log('for peer id: ' + id);
        if(id)
                this.channel.send(new p2pPacket('setId', new setIdPacket(id), false));
}

var mozCreateSocketForPeer = function(peeringPkt, onConnected) {
	console.log('Creating a new socket');
	var self = this;
  var localPort = Math.round(Math.random() * (500)) + 5000;
  var remotePort = peeringPkt.body.PORT_NUMBER;
  

  // 1. Setting received offer as remote description
  this.peerConnection = new mozRTCPeerConnection({ "iceServers": [ { url:"stun:stun.l.google.com:19302" } ] });
  navigator.mozGetUserMedia({audio:true, fake:true}, function(stream) {
	  self.peerConnection.addStream(stream);
	  self.peerConnection.ondatachannel = function(channel) {
	    channel.onopen = function() {
			console.log('channel opened');
	      self.channel.connectViaSocket(channel, peeringPkt.body.originator);
	      onConnected();
	    };
	  }
	  self.peerConnection.setRemoteDescription(peeringPkt.body.completeSDP, onOfferAdded, generalFailureCallback);  
  }, generalFailureCallback);

  // 2. Create a new answer
  var onOfferAdded = function() {
	  console.log('offer added');
    self.peerConnection.createAnswer(onAnswerCreated, generalFailureCallback);
  }

  // 3. Managing answer
  var onAnswerCreated = function(answer) {
	  console.log('answer created');
    var peeringReplyPkt = new peeringReplyPacket(client.id);
    peeringReplyPkt.completeSDP = answer;
    peeringReplyPkt.PORT_NUMBER = localPort;
    var p2pPkt = new p2pPacket('peeringReply', peeringReplyPkt, false);
    p2pPkt.path = peeringPkt.path;
    client.carryHome(p2pPkt);
    self.peerConnection.setLocalDescription(answer, startConnection, generalFailureCallback);
  }

  // 4. Starting connection procedure
  var startConnection = function() {
	  console.log('start connectioooo');
	  console.log("local " + localPort + "<br>remote " + remotePort);
    self.peerConnection.connectDataConnection(localPort, remotePort);
  }



}
 
var chromeCreateSocketForPeer = function(peeringPkt, onConnected) {
	var self = this;

	var RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
	var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
	var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;
	
	var candidatesNumber = 0;
	var peeringReplyPkt = new peeringReplyPacket(client.id);
	
	// 3. once added the remote description
	var onRemoteDescriptionAdded = function() {
		self.peerConnection.createAnswer(onAnswerCreated, generalFailureCallback, {});		
	}
	
	// 4. once answer created
	var onAnswerCreated = function(answer) {
		peeringReplyPkt.fromAnswer(answer);
		self.peerConnection.setLocalDescription(answer);
	}

		// 1. create a peerconnection object
		this.peerConnection = new RTCPeerConnection( { iceServers: [ { url : "stun:stun.l.google.com:19302" } ] }, { optional: [ { RtpDataChannels: true } ] });
		//this.peerConnection = new RTCPeerConnection( null, { optional: [ { RtpDataChannels: true } ] });
		// 2. set the connection callback
		this.peerConnection.onicecandidate = function(event) {

			if (event.candidate) {
				//peeringPkt['c' + candidatesNumber] = event.candidate.candidate;
				peeringReplyPkt.cds.push(event.candidate.candidate);
			} else {
				var p2pPkt = new p2pPacket('peeringReply', peeringReplyPkt, false);
				p2pPkt.path = peeringPkt.path;
				client.carryHome(p2pPkt);
				//self.channel.send(new p2pPacket('peeringReply', peeringReplyPkt, false));

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
 
var mozFindSomeoneElse = function(basePeer, onPeerFound) {
}

var chromeFindSomeoneElse = function(basePeer, onPeerFound) {
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
                        onPeerFound(null, retrievedPeerId);
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
                                basePeer.channel.send(new p2pPacket('peering', peeringPkt.fromOffer(self.peerConnection.localDescription), true));
                                console.log(self.peerConnection.localDescription.sdp);
                }
        }
       
       
        // 3. create a temporany data channel
        var localDataChannel = this.peerConnection.createDataChannel('datachannel', { reliable : false, outOfOrderAllowed : true, maxRetransmitNum : 0 });
        // 4. set this data channel as peer channel when it connects
        localDataChannel.onopen = function() {
                console.log('Offer open + ' + localDataChannel.label);
                onPeerFound(localDataChannel, retrievedPeerId);
    };
 
        basePeer.channel.on('peeringReply', onPeeringReply);
 
        // 5. create an offer
        this.peerConnection.createOffer(onOfferCreated, generalFailureCallback, {});
 
}
 
var mozFindFirstPeer = function(onPeerFound) {
	console.log('findin first peer');
  var self = this;
  var RTCPeerConnection = window.mozRTCPeerConnection;

  var localPort = Math.round(Math.random() * (500)) + 5000;
  var remotePort = null;
  var retrievedPeerId = null;


  // 1. create a new peerConnection
  this.peerConnection = new RTCPeerConnection({ "iceServers": [ { url:"stun:stun.l.google.com:19302" } ] });
  
  this.peerConnection.onconnection = function() {
	  console.log('peerconnection connected');
    var localDataChannel = self.peerConnection.createDataChannel("datachannel", {});
	onPeerFound(localDataChannel, retrievedPeerId);
	

  }


  // 2. Gathering a fake audio stream
  navigator.mozGetUserMedia({audio:true, fake:true}, function(stream) {
	  console.log('fake stream added');
    self.peerConnection.addStream(stream);
    self.peerConnection.createOffer(onOfferCreated, generalFailureCallback);
  }, generalFailureCallback);

  // 3. Sending freshly created offer
  var onOfferCreated = function(offer) {
	self.channel.on('peeringReply', onPeeringReply);
	console.log('offer created');
    self.peerConnection.setLocalDescription(offer);
	console.log('offer added as local descriptor');
    var peeringPkt = new peeringPacket(client.id);
	console.log('pkt created');
    peeringPkt.completeSDP = offer;
	console.log('setting offer ' + JSON.stringify(offer));
    peeringPkt.PORT_NUMBER = localPort;
    self.channel.send(new p2pPacket('peering', peeringPkt, true));
	console.log('pkt sent');
  }

  // 4. Received answer
  var onPeeringReply = function(reply) {
	  console.log('answer received' + JSON.stringify(reply));
    retrievedPeerId = reply.body.originator;
    remotePort = reply.body.PORT_NUMBER;
    self.peerConnection.setRemoteDescription(reply.body.completeSDP, startConnection, generalFailureCallback);
  }

  // 5. Starting connection procedure
  var startConnection = function() {
	  console.log('starting connection');
	  console.log("local " + localPort + "<br>remote " + remotePort);
    self.peerConnection.connectDataConnection(localPort, remotePort);
  }


}

var chromeFindFirstPeer = function(onPeerFound) {
	var self = this;
		var retrievedPeerId = null;

		var RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
		var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
		var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;

		var candidatesNumber = 0;
		var peeringPkt = new peeringPacket(client.id);

		// 6. send the offer when ready
		var onOfferCreated = function(offer) {
			console.log(offer.sdp);
			peeringPkt.fromOffer(offer);
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
				onPeerFound(null, retrievedPeerId);
			}

			//self.peerconnection = null;

		}

		// 1. create a peerconnection object
		this.peerConnection = new RTCPeerConnection( { iceServers: [ { url : "stun:stun.l.google.com:19302" } ] }, { optional: [ { RtpDataChannels: true } ] });
		//this.peerConnection = new RTCPeerConnection( null, { optional: [ { RtpDataChannels: true } ] });
		// 2. set the connection callback
		this.peerConnection.onicecandidate = function(event) {
			console.log(event.candidate);
			if (event.candidate) {
				//peeringPkt['c' + candidatesNumber] = event.candidate.candidate;
				peeringPkt.cds.push(event.candidate.candidate);
			} else {
				self.channel.send(new p2pPacket('peering', peeringPkt, true));
			}
		}


		// 3. create a temporany data channel
		var localDataChannel = this.peerConnection.createDataChannel('datachannel', { reliable : false, outOfOrderAllowed : true, maxRetransmitNum : 0 });
		// 4. set this data channel as peer channel when it connects
		localDataChannel.onopen = function() {
			console.log('Offer open + ' + localDataChannel.label);
			onPeerFound(localDataChannel, retrievedPeerId);
	    };

		this.channel.on('peeringReply', onPeeringReply);

		// 5. create an offer
		this.peerConnection.createOffer(onOfferCreated, generalFailureCallback, {});
}
 
var generalFailureCallback = function(errorMessage) {
        throw errorMessage
}
 
exports.Peer = window.Peer = Peer;
