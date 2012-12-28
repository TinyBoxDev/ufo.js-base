describe('Client:\n', function() {
	var thisClient = null;
	
	before(function(done){
		done();
	});
	
	after(function(done){
		done();
	});
	
	beforeEach(function(done) {
		thisClient = new Client.Client();
		done();
	});

	afterEach(function(done){
		done();
	});
	
	it('Should have a peer array', function(done) {
		thisClient.should.have.property('connectionPool');
		assert(thisClient.connectionPool instanceof Array);
		done();
    });
	
});