/*
	Test suite for p2pPacket.js
*/

describe('P2P Packet:\n', function(){
	var thisP2pPacket = null;
	
	before(function(done){
		done();
	});
	
	after(function(done){
		done();
	});
	
	beforeEach(function(done){
		thisP2pPacket = new p2pPacket(null, null);
		done();
	});

	afterEach(function(done){
		done();
	});
	
	it('Should have type field', function(done) {
		thisP2pPacket.should.have.property('type');
		done();
	});

	it('Should have a body field', function(done) {
		thisP2pPacket.should.have.property('body');
		done();
	});

	it('Should initialize the fields', function(done) {
		var anotherPacket = new p2pPacket('caccaType', 'caccaBody');
		anotherPacket.type.should.eql('caccaType');
		anotherPacket.body.should.eql('caccaBody');
		done();
	});
});
