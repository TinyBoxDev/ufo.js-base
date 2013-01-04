window = global;
var http = require('http');
require('should');
var BSPeer = require('../lib/bsPeer');
var assert = require('assert');
var WebSocket = require('ws');
var p2pPacket = require('../lib/p2pPacket').p2pPacket;

describe('BSPeer:\n', function(){
	//this.timeout(35000);
	var thisBSPeer = null;
	var server = http.createServer().listen(5000);
	
    before(function(done) {
	thisBSPeer = BSPeer.bspeer;
	thisBSPeer.startServer(server);
	done();
    });

    after(function(done){
	done();
    });
	
    beforeEach(function(done) {
    	thisBSPeer.pool = new connectionPool();
		done();
    });

    afterEach(function(done) {
	done();
    });

    it('Should have a peer array', function(done) {
	thisBSPeer.should.have.property('pool');
	assert(thisBSPeer.pool instanceof connectionPool);
	done();
    });

    it('Should have a starting server method', function(done) {
	thisBSPeer.should.have.property('startServer');
	done();
    });
    
    it('Should accept socket io connections', function(done) {
	
	var onConnectionPerformed = function(data) {
	    done();
	}
	
	var testClient = new WebSocket('ws://0.0.0.0:5000');
	testClient.on('open', onConnectionPerformed);
    });

    it('Should accept a peering request if pool is not full', function(done) {
	
		var checkPeeringReply = function(data) {
	    	data = JSON.parse(data);
	    	data.should.have.property('type');
	    	if(data.type == 'peeringReply') {
				data.body.should.have.property('answer');
				assert(data.body.answer == null);
				done();
			}
		}
		
		var sendPeeringRequest = function() {
			var pkt = new p2pPacket('peering', 'test request');
			pkt.addIDToPath('cacca');
	    	testClient.send(pkt.toString());
		}

		var testClient = new WebSocket('ws://0.0.0.0:5000');
		testClient.on('open', sendPeeringRequest);
		testClient.on('message', checkPeeringReply);
    });
    
    it('Should broadcast a peering request if pool is full', function(done) {
		var checkPeering = function(data) {
	    	data = JSON.parse(data);	    
	    	data.should.have.property('type');
	    	if(data.type == 'peering') {
				data.body.should.have.property('offer');
				done();
	    	}
		}

		var sendPeeringRequest = function() {
			var pkt = new p2pPacket('peering', 'test request');
			pkt.addIDToPath('cacca');
	    	testClient.send(pkt.toString());
		}

		var testClient = new WebSocket('ws://0.0.0.0:5000');
		var conn1 = new WebSocket('ws://0.0.0.0:5000');
		var conn2 = new WebSocket('ws://0.0.0.0:5000');
		var conn3 = new WebSocket('ws://0.0.0.0:5000');
		var conn4 = new WebSocket('ws://0.0.0.0:5000');
		conn1.on('message', checkPeering);
		conn2.on('message', checkPeering);
		conn3.on('message', checkPeering);
		conn4.on('message', checkPeering);
		thisBSPeer.pool.pushConnection('conn1', conn1);
		thisBSPeer.pool.pushConnection('conn2', conn2);
		thisBSPeer.pool.pushConnection('conn3', conn3);
		thisBSPeer.pool.pushConnection('conn4', conn4);
		testClient.on('open', sendPeeringRequest);
	});
    
});
