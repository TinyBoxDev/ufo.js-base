var connectionPool = function(connectionPoolSize) {
    this.usedConnections = 0;
    this.size = (connectionPoolSize) ? connectionPoolSize : 4;
}

connectionPool.prototype.pushConnection = function(connectionName, connection) {
    if(this.usedConnections < this.size) {
	
	this[this.usedConnections] = connectionName;
	this[connectionName] = connection;
	this.usedConnections++;
	this.onPoolChanged();
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
		this.onPoolChanged();
    }
}

connectionPool.prototype.exists = function(connectionName) {
	return this[connectionName] ? true : false;
}


connectionPool.prototype.getIds = function() {
	var thisAsArray = new Array();
	for(var index=0; index<this.usedConnections; index++)
		thisAsArray.push(this[index]);

	return thisAsArray;
}

connectionPool.prototype.onPoolChanged = function() { console.log(this) };


exports.connectionPool = window.connectionPool = connectionPool;
