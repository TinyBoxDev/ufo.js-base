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
		done();
	});

	afterEach(function(done){
		done();
	});
	
	it('Should have a peer array', function(done) {
		client.should.have.property('connectionPool');
		assert(client.connectionPool instanceof Array);
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
	
});
