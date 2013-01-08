window = global;
var http = require('http');
require('should');
var BSPeer = require('../lib/bsPeer');
var assert = require('assert');
var WebSocket = require('ws');
var p2pPacket = require('../lib/p2pPacket').p2pPacket;

describe('BSPeer:\n', function(){
	this.timeout(15000);
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
		var conn1 = new WebSocket('ws://0.0.0.0:5000');
		conn1.on('message', function(data) {
			//console.log('con1 : ' + data);			
			data = JSON.parse(data);
			if(data.type === 'setId') {
				//console.log('sending peering');
				var pkt = new p2pPacket('peering', new peeringPacket('offer1', data.body.id));
				pkt.addIDToPath(data.body.id);
				//console.log(pkt);
	    		conn1.send(pkt.toString());
			}
			else if(data.type === 'peering') {
				//console.log('received peering packet');
				done();
			}
		});

		var conn2 = new WebSocket('ws://0.0.0.0:5000');
		conn2.on('message', function(data) {
			//console.log('con2 : ' + data);			
			data = JSON.parse(data);
			if(data.type === 'setId') {
				//console.log('sending peering');
				var pkt = new p2pPacket('peering', new peeringPacket('offer2', data.body.id));
				pkt.addIDToPath(data.body.id);
				//console.log(pkt);
	    		conn2.send(pkt.toString());
			}
			else if(data.type === 'peering') {
				//console.log('received peering packet');
				done();
			}
		});

		var conn3 = new WebSocket('ws://0.0.0.0:5000');
		conn3.on('message', function(data) {
			//console.log('con3 : ' + data);			
			data = JSON.parse(data);
			if(data.type === 'setId') {
				//console.log('sending peering');
				var pkt = new p2pPacket('peering', new peeringPacket('offer3', data.body.id));
				pkt.addIDToPath(data.body.id);
				//console.log(pkt);
	    		conn3.send(pkt.toString());
			}
			else if(data.type === 'peering') {
				//console.log('received peering packet');
				done();
			}
		});

		var conn4 = new WebSocket('ws://0.0.0.0:5000');
		conn4.on('message', function(data) {
			//console.log('con4 : ' + data);			
			data = JSON.parse(data);
			if(data.type === 'setId') {
				//console.log('sending peering');
				var pkt = new p2pPacket('peering', new peeringPacket('offer4', data.body.id));
				pkt.addIDToPath(data.body.id);
				//console.log(pkt);
	    		conn4.send(pkt.toString());
			}
			else if(data.type === 'peering') {
				//console.log('received peering packet');
				done();
			}

		});


		var outOfSpace = new WebSocket('ws://0.0.0.0:5000');
		outOfSpace.on('message', function(data) {
			//console.log('outOfSpace : ' + data);			
			data = JSON.parse(data);
			if(data.type === 'setId') {
				//console.log('sending peering');
				var pkt = new p2pPacket('peering', new peeringPacket('outOfSpace', data.body.id));
				pkt.addIDToPath(data.body.id);
				//console.log(pkt);
	    		outOfSpace.send(pkt.toString());
			}
			else if(data.type === 'peering') {
				//console.log('received peering packet');
				done();
			}

		});
		
	});

    it('Should reject a packet with every peer ids of the connection pool into the path', function(done) {
	    var injectedPath = [];	
	    var conn1 = new WebSocket('ws://0.0.0.0:5000');
		conn1.on('message', function(data) {
			//console.log('con1 : ' + data);			
			data = JSON.parse(data);
			if(data.type === 'setId') {
				injectedPath.push(data.body.id);
				//console.log('sending peering');
				var pkt = new p2pPacket('peering', new peeringPacket('offer1', data.body.id));
				pkt.addIDToPath(data.body.id);
				//console.log(pkt);
    			conn1.send(pkt.toString());
			}
			//else if(data.type === 'peering') {
			//	console.log('received peering packet');
			//}
		});

		var conn2 = new WebSocket('ws://0.0.0.0:5000');
		conn2.on('message', function(data) {
			//console.log('con2 : ' + data);			
			data = JSON.parse(data);
			if(data.type === 'setId') {
				injectedPath.push(data.body.id);				
				//console.log('sending peering');
				var pkt = new p2pPacket('peering', new peeringPacket('offer2', data.body.id));
				pkt.addIDToPath(data.body.id);
				//console.log(pkt);
	    		conn2.send(pkt.toString());
			}
			else if(data.type === 'peering') {
				//console.log('received peering packet');
			}
		});

		var conn3 = new WebSocket('ws://0.0.0.0:5000');
		conn3.on('message', function(data) {
			//console.log('con3 : ' + data);			
			data = JSON.parse(data);
			if(data.type === 'setId') {
				injectedPath.push(data.body.id);				
				//console.log('sending peering');
				var pkt = new p2pPacket('peering', new peeringPacket('offer3', data.body.id));
				pkt.addIDToPath(data.body.id);
				//console.log(pkt);
	    		conn3.send(pkt.toString());
			}
			//else if(data.type === 'peering') {
			//	console.log('received peering packet');
			//}
		});

		var conn4 = new WebSocket('ws://0.0.0.0:5000');
		conn4.on('message', function(data) {
			//console.log('con4 : ' + data);			
			data = JSON.parse(data);
			if(data.type === 'setId') {
				injectedPath.push(data.body.id);				
				//console.log('sending peering');
				var pkt = new p2pPacket('peering', new peeringPacket('offer4', data.body.id));
				pkt.addIDToPath(data.body.id);
				//console.log(pkt);
	    		conn4.send(pkt.toString());
			}
			//else if(data.type === 'peering') {
			//	console.log('received peering packet');
			//}

		});


		setTimeout(function() {
			var outOfSpace = new WebSocket('ws://0.0.0.0:5000');
			outOfSpace.on('message', function(data) {
				//console.log('outOfSpace : ' + data);			
				data = JSON.parse(data);
				if(data.type === 'setId') {
					injectedPath.push(data.body.id);				
					//console.log('sending peering');
					var pkt = new p2pPacket('peering', new peeringPacket('outOfSpace', data.body.id));
					pkt.path = injectedPath;
					//console.log(pkt);
	    			outOfSpace.send(pkt.toString());
				}
				//else if(data.type === 'peering') {
				//	console.log('received peering packet');
				//}
	
			});
		}, 4000);
		setTimeout(done, 14000);
	});
    
});
