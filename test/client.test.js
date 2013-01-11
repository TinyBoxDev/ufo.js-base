describe('Client:\n', function() {
	this.timeout(15000);
	var thisClient = null;
	
	before(function(done){
		done();
	});
	
	after(function(done){
		done();
	});
	
	beforeEach(function(done) {
		client.pool = new connectionPool();
		done();
	});

	afterEach(function(done){
		done();
	});
	
	it('Should have a peer array', function(done) {
		client.should.have.property('pool');
		assert(client.pool instanceof connectionPool);
		done();
    	});

    it('Should have an id after bootstrap', function(done) {
	client.should.have.property('id');
	assert(client.id === null);
	client.onPeerFound = function() {
	    assert(client.id != null);
	    done();
	}
	client.bootstrap();
    });

	it('Should perform a bootstrap', function(done) {
		client.onPeerFound = done;

		client.bootstrap();
	});
	
	it('Should accept a new connection if pool has a slot', function(done) {
		client.should.have.property('onPeering');
		
		var remotePort = null;
		
		var callingPeer = {
			send : function(pkt) {
				console.log(pkt);
				//console.log('connect!');
				remotePort = pkt.body.port;
				pc.setRemoteDescription(new RTCSessionDescription(pkt.body.answer), function() { connect(pkt); }, function(error) { console.log(error); });	
			}
		}

		var connect = function(pkt) {
			console.log('connect!');
			//pc.connectDataConnection(5000, remotePort);
			pkt.body.candidates.forEach(function(candidate){
				console.log(candidate);
				pc.addIceCandidate(new RTCIceCandidate(candidate));
  			});

		}

		var onOfferCreated = function(offer) {
			pc.setLocalDescription(offer);
		}

		var candidatesArray = [];
		//var pc = new mozRTCPeerConnection();
		
		var pc = new webkitRTCPeerConnection( null, { optional: [ { RtpDataChannels: true } ] });
		pc.onconnection = function() {};
		
		pc.onicecandidate = function(event) {	
			if (event.candidate) {
				candidatesArray.push(event.candidate);
				if (candidatesArray.length == 4) {
					var pkt = new p2pPacket('peering', 
								new peeringPacket(pc.localDescription, candidatesArray, 'testOriginator', '9000'));
					pkt.addIDToPath('testOriginator');
					client.onPeering(pkt, callingPeer);				
				}
			}
		}

		var dc = pc.createDataChannel('datachannel', { reliable : false });		
		dc.onopen = function() {
			console.log('open test data channel');
			setTimeout(function() {
				assert(client.pool.testOriginator != undefined);
				pc.close();
				done();
			}, 1000);

		}


		pc.createOffer(onOfferCreated, function(error) { console.log(error); }, {});

		//navigator.mozGetUserMedia({audio:true, fake:true}, onFakeStreamDone, function(error) { console.log(error); });
			
	});
	
});
