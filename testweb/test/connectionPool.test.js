describe('Connection Pool:\n', function() {
    var thisConnectionPool = null;

    before(function(done) {
	done();
    });

    after(function(done) {
	done();
    });

    beforeEach(function(done) {
	thisConnectionPool = new connectionPool();
	done();
    });

    afterEach(function(done) {
	done();
    });

    it('Should have usedConnections field', function(done) {
	thisConnectionPool.should.have.property('useConnections');
	done();
    });
    
    it('Should have size field', function(done) {
	thisConnectionPool.should.have.property('size');
	done();
    });

    it('Should create pool with init values', function(done) {
	var secondPool = new connectionPool(10);
	thisConnectionPool.size.should.eql(0);
	secondPool.size.should.eql(10);
	done();
    });

});
