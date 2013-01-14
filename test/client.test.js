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
		client.id = null;
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
	client.onBootstrapPerformed = function() {
	    assert(client.id != null);
	    done();
	}
	client.bootstrap();
    });

	it('Should perform a bootstrap', function(done) {
		client.onBootstrapPerformed = done;

		client.bootstrap();
	});
	
	it('Should accept a new connection if pool has a slot', function(done) {
		client.should.have.property('onPeering');
		
		client.carryHome = function(message) {
			console.log(message);
			pc.setRemoteDescription(new RTCSessionDescription(new peeringReplyPacket().fill(message.body).toAnswer()), function() { connect(message); }, function(error) { console.log(error); });		
		}

		var remotePort = null;
		
		var connect = function(pkt) {
			console.log('connect!');
		}

		var onOfferCreated = function(offer) {
			pc.setLocalDescription(offer);
		}

		var pc = new webkitRTCPeerConnection( null, { optional: [ { RtpDataChannels: true } ] });
		
		var candidatesNumber = 0;
		pc.onicecandidate = function(event) {	
			if (event.candidate && ++candidatesNumber==4) {
				var pkt = new p2pPacket('peering', 
						new peeringPacket('testOriginator').fromOffer(pc.localDescription), false);
				pkt.addIDToPath('testOriginator');
				client.onPeering(pkt, {});				
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
			
	});
	
});
