/*
	Test suite for peeringPacket.js
*/

describe('Peering Packet:\n', function(){
	var thisPeeringPacket = null;
	
	before(function(done){
		done();
	});
	
	after(function(done){
		done();
	});
	
	beforeEach(function(done){
		thisPeeringPacket = new peeringPacket.peeringPacket(null);
		done();
	});

	afterEach(function(done){
		done();
	});
	
	it('Should have an offer field', function(done) {
		thisPeeringPacket.should.have.property('offer');
		done();
	});

	it('Should initialize the offer field', function(done) {
		var anotherPacket = new peeringPacket.peeringPacket('cacca');
		anotherPacket.offer.should.eql('cacca');
		done();
	});
});
