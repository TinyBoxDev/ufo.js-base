var connectionPool = function(connectionPoolSize) {
    this.usedConnections = 0;
    this.size = (connectionPoolSize) ? connectionPoolSize : 4;
}

connectionPool.prototype.pushConnection = function(connectionName, connection) {
    if(this.usedConnections < this.size) {
	this[connectionName] = connection;
	this.usedConnections++;
    } else {
	throw new Error({'msg' : 'connection pool out of space'});
    }
}

connectionPool.prototype.getConnectionByName = function(connectionName) {
    return this[connectionName];
}

connectionPool.prototype.deleteConnectionByName = function(connectionName) {
    if(this[connectionName]) {
	this[connectionName] = null;
	this.usedConnections--;
    }
}

exports.connectionPool = window.connectionPool = connectionPool;