var connectionPool = function(connectionPoolSize) {
    this.usedConnections = 0;
    this.size = (connectionPoolSize) ? connectionPoolSize : 4;
}

connectionPool.prototype.pushConnection = function(connectionName, connection) {
    if(this.usedConnections < this.size) {
	this[connectionName] = connection;
	this.usedConnections++;
	return 'done';
    } else return 'maxPoolSizeReached';
}

connectionPool.prototype.getConnectionByName = function(connectionName) {
    return this[connectionName] ? this[connectionName] : 'undefined';
}

connectionPool.prototype.deleteConnectionByName = function(connectionName) {
    if(this[connectionName]) {
	this[connectionName] = null;
	this.usedConnections--;
    } else return 'undefined';
}

exports.connectionPool = window.connectionPool = connectionPool;
