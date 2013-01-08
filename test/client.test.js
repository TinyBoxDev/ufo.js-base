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

		var callingPeer = {
			send : function(pkt) {
				pc.setRemoteDescription(pkt.body.answer, connect, function(error) { console.log(error); });	
			}
		}

		var connect = function() {
			pc.connectDataConnection(5000,5001);
		}

		var onFakeStreamDone = function(stream) {
			pc.addStream(stream);
			pc.createOffer(onOfferCreated, function(error) { console.log(error); });
		}

		var onOfferCreated = function(offer) {
			pc.setLocalDescription(offer);
			var pkt = new p2pPacket('peering', new peeringPacket(offer, 'testOriginator'));
			pkt.addIDToPath('bss');
			client.onPeering(pkt, callingPeer);
		}

		var pc = new mozRTCPeerConnection();
		pc.onconnection = function() {
			setTimeout(function() {
				assert(client.pool.testOriginator != undefined);
				pc.close();
				done();
			}, 1000);
		}
		navigator.mozGetUserMedia({audio:true, fake:true}, onFakeStreamDone, function(error) { console.log(error); });
			
	});
	
});
