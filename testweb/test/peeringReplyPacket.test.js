/*
	Test suite for peeringReplyPacket.js
*/

describe('Peering Reply Packet:\n', function(){
	var thisPeeringReplyPacket = null;
	
	before(function(done){
		done();
	});
	
	after(function(done){
		done();
	});
	
	beforeEach(function(done){
		thisPeeringReplyPacket = new peeringReplyPacket.peeringReplyPacket(null);
		done();
	});

	afterEach(function(done){
		done();
	});
	
	it('Should have an answer field', function(done) {
		thisPeeringReplyPacket.should.have.property('answer');
		done();
	});

	it('Should initialize the answer field', function(done) {
		var anotherPacket = new peeringReplyPacket.peeringReplyPacket('cacca');
		anotherPacket.answer.should.eql('cacca');
		done();
	});
});
