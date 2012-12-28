require('should');
var BSPeer = require('../lib/bsPeer');
var assert = require('assert');
var io = require('socket.io-client');
var p2pPacket = require('../public/js/p2pPacket').p2pPacket;
var options ={ 'force new connection': true };

describe('BSPeer:\n', function(){
	//this.timeout(15000);
	var thisBSPeer = null;
	var server = null;
	
    before(function(done) {
	thisBSPeer = new BSPeer.BSPeer();
	server = require('http').createServer();
	thisBSPeer.startServer(server);
	server.listen(8080);
	done();
    });

    after(function(done){
	done();
    });
	
    beforeEach(function(done) {
	done();
    });

    afterEach(function(done) {
	done();
    });

    it('Should have a peer array', function(done) {
	thisBSPeer.should.have.property('connectionPool');
	assert(thisBSPeer.connectionPool instanceof Array);
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
	
	var testClient = io.connect('http://0.0.0.0:8080', options);
	testClient.on('connect', onConnectionPerformed);
    });

    it('Should accept a peering request if pool is not full', function(done) {
	
	var checkPeeringReply = function(data) {
	    data.should.have.property('type');
	    assert(data.type == 'peeringReply');
	    data.body.should.have.property('answer');
	    assert(data.body.answer == null);
	    done();
	}

	var sendPeeringRequest = function() {
	    testClient.emit('p2pws', new p2pPacket('peering', 'test request'));
	}

	var testClient = io.connect('http://0.0.0.0:8080', options);
	testClient.on('connect', sendPeeringRequest);
	testClient.on('p2pws', checkPeeringReply);
    });

    it('Should broadcast a peering request if pool is full', function(done) {

	var checkPeeringReply = function(data) {
	    data.should.have.property('type');
	    assert(data.type == 'peeringReply');
	    data.body.should.have.property('answer');
	    //assert(data.body.answer != null);
	    //setTimeout(done, 5000);
		done();
	}

	var sendPeeringRequest = function() {
	    testClient.emit('p2pws', new p2pPacket('peering', 'test request'));
	}
	
	var testClient = io.connect('http://0.0.0.0:8080', options);
	testClient.on('connect', sendPeeringRequest);
	testClient.on('p2pws', checkPeeringReply)
	
    });
    
});
