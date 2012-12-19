/*
	Test suite for peer.js
*/

describe('Peer:\n', function(){
	var thisPeer = null;
	
	before(function(done){
		done();
	});
	
	after(function(done){
		done();
	});
	
	beforeEach(function(done){
		thisPeer = new Peer();
		done();
	});

	afterEach(function(done){
		done();
	});
	
	it('Should have a channel', function(done) {
		thisPeer.should.have.property('channel');
		done();
	});
	
	describe('Peering process:\n', function() {
		it('Should be able to allocate a channel', function(done) {
			var innerTestFunction = function() {
				assert(thisPeer.channel!=null);
				done();
			}
			thisPeer.connect('http://p2pwebsharing.herokuapp.com', innerTestFunction);
		});
	});
	
});