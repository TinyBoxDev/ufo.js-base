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
		thisPeeringPacket = new peeringPacket(null, null, null, null);
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
		var anotherPacket = new peeringPacket('cacca');
		anotherPacket.offer.should.eql('cacca');
		done();
	});
	
	it('Should have a originator field', function(done) {
		thisPeeringPacket.should.have.property('originator');
		done();
	});
});
