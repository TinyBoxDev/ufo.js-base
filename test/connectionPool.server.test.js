var assert = require('assert');

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
		thisConnectionPool.should.have.property('usedConnections');
		done();
    });
    
    it('Should have size field', function(done) {
		thisConnectionPool.should.have.property('size');
		done();
    });

    it('Should create pool with init values', function(done) {
		var secondPool = new connectionPool(10);
		thisConnectionPool.size.should.eql(4);
		thisConnectionPool.usedConnections.should.eql(0);
		secondPool.size.should.eql(10);
		done();
    });

    it('Should push new connection inside the pool', function(done) {
		thisConnectionPool.pushConnection('myTestConnection', 'connectionBody');
		thisConnectionPool.should.have.property('myTestConnection');
		thisConnectionPool.myTestConnection.should.eql('connectionBody');
		done();
    });

    it('Should not push new connection if pool is full', function(done) {
		thisConnectionPool.pushConnection('myTestConnection1', 'connectionBody');
		thisConnectionPool.pushConnection('myTestConnection2', 'connectionBody');
		thisConnectionPool.pushConnection('myTestConnection3', 'connectionBody');
		thisConnectionPool.pushConnection('myTestConnection4', 'connectionBody');
		try {
	    	thisConnectionPool.pushConnection('myTestConnection5', 'connectionBody');
	    } catch(error) {
	    	done();
	    }
    });

    it('Should get existing connection from pool', function(done) {
		thisConnectionPool.pushConnection('myTestConnection1', 'connectionBody');
		assert('connectionBody' === thisConnectionPool.getConnectionByName('myTestConnection1'));
		done();
    });

    it('Should not get not existing connection from pool', function(done) {
		assert(!thisConnectionPool.getConnectionByName('myTestConnection1'));
		done();
    });

    it('Should delete existing connection from pool', function(done) {
		thisConnectionPool.pushConnection('myTestConnection1', 'connectionBody');
		thisConnectionPool.deleteConnectionByName('myTestConnection1');
		assert(!thisConnectionPool.getConnectionByName('myTestConnection1'));
		thisConnectionPool.usedConnections.should.eql(0);
		done();
    });

    it('Should manage deleting of unexistign connection from pool', function(done) {
		thisConnectionPool.pushConnection('myTestConnection1', 'connectionBody');
		thisConnectionPool.deleteConnectionByName('myTestConnection2');
		assert(!thisConnectionPool.getConnectionByName('myTestConnection2'));
		thisConnectionPool.usedConnections.should.eql(1);
		done();
    });

	it('Should return false if a connection doesn\'t exist', function(done) {
		assert(false === thisConnectionPool.exists('cacca'));
		done();
	});
	
	it('Should return true if a connection exists', function(done) {
		thisConnectionPool.pushConnection('cacca', 'caccaConnection');
		assert(true === thisConnectionPool.exists('cacca'));
		done();
	});

	/*
	it('Should return an array with all ids', function(done) {
		thisConnectionPool.pushConnection('test1', 'conn1');
		thisConnectionPool.pushConnection('test2', 'conn2');
		thisConnectionPool.pushConnection('test3', 'conn3');
		var idsArray = thisConnectionPool.getIds();
		assert(idsArray instanceof Array);
		assert(idsArray.indexOf('test1') != -1 && idsArray.indexOf('test2') != -1 && idsArray.indexOf('test3') != -1);
		done();
	});
	*/

});
