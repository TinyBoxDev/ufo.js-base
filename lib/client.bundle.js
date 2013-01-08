(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process,global){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process,global){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("/connectionPool.js",function(require,module,exports,__dirname,__filename,process,global){var connectionPool = function(connectionPoolSize) {
    this.usedConnections = 0;
    this.size = (connectionPoolSize) ? connectionPoolSize : 4;
}

connectionPool.prototype.pushConnection = function(connectionName, connection) {
    if(this.usedConnections < this.size) {
	
	this[this.usedConnections] = this[connectionName] = connection;
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

connectionPool.prototype.exists = function(connectionName) {
	return this[connectionName] ? true : false;
}

/*
connectionPool.prototype.getIds = function() {
	var thisAsArray = new Array();
	for(var index=0; index<this.usedConnections; index++)
		thisAsArray.push(this[index]);

	return thisAsArray;
}
*/

exports.connectionPool = window.connectionPool = connectionPool;

});

require.define("/peer.js",function(require,module,exports,__dirname,__filename,process,global){var Channel = require('./channel').Channel;
var p2pPacket = require('./p2pPacket').p2pPacket;
var peeringPacket = require('./peeringPacket').peeringPacket;
var peeringReplyPacket = require('./peeringReplyPacket').peeringReplyPacket;
var setIdPacket = require('./setIdPacket').setIdPacket;

var Peer = function(bootstrapServerAddress, onBootstrapPerformed) {
	var self = this;
	this.channel = new Channel();
	this.channel.on('setId', function(setIdPacket) {
		client.id = setIdPacket.body.id;
	});
	this.channel.on('peering', function(peeringPacket) {
		client.onPeering(peeringPacket, self);
	});
	
	this.peerConnection = null;
	
	this.localPort = Math.round(Math.random() * (500)) + 5000;
	this.remotePort = null;

	if(bootstrapServerAddress)
		this.channel.connectByName(bootstrapServerAddress, onBootstrapPerformed);
}

Peer.prototype.setSocketForPeer = function(socket, id) {
	this.channel.connectViaSocket(socket, id);
	if(id)
		this.channel.send(new p2pPacket('setId', new setIdPacket(id)));
}

Peer.prototype.sendPeeringReply = function(answer) {
	this.channel.send(new p2pPacket('peeringReply', new peeringReplyPacket(answer)));
}

Peer.prototype.createSocketForPeer = function(peeringPacket, callingPeer, onConnected) {
	var self = this;

	/* Step 0R of the peering process: set a fake audio stream */
	var onFakeStreamDone = function(stream) {
		self.peerConnection.addStream(stream);
		self.peerConnection.setRemoteDescription(peeringPacket.body.offer, onOfferAdded, generalFailureCallback);
	}

	/* Step 1R of the peering process: prepare an answer */
	var onOfferAdded = function() {
		self.peerConnection.createAnswer(onAnswerCreated, generalFailureCallback);
	}

	/* Step 2R of the peering process: send answer back to callingPeer and set it as local description */
	var onAnswerCreated = function(answer) {
		var peeringReply = new p2pPacket('peeringReply', new peeringReplyPacket(answer, client.id, self.localPort));
		peeringReply.path = peeringPacket.path;
		callingPeer.send(peeringReply);
		self.peerConnection.setLocalDescription(answer, connectToPeer, generalFailureCallback);
	}

	/* Step 3R of the peering process: connect to peer */
	var connectToPeer = function() {
		self.peerConnection.connectDataConnection(self.localPort, self.remotePort);
	}	

	this.peerConnection = new mozRTCPeerConnection();
	this.remotePort = peeringPacket.body.port;

	/* Step 4R of the peering process: save data channel as new wrapped channel */
	this.peerConnection.onconnection = function() {
		self.channel.connectViaSocket(self.peerConnection.createDataChannel("Reliable data channel :)",{}), peeringPacket.body.originator);
		onConnected();
	}

	navigator.mozGetUserMedia({audio:true, fake:true}, onFakeStreamDone, generalFailureCallback);
}

Peer.prototype.lookForAPeer = function(onPeerFound) {
	var self = this;
	
	var retrievedPeerId = null;

	/* Step 0I of the peering process: set a fake audio stream */
	var onFakeStreamDone = function(stream) {
		self.peerConnection.addStream(stream);
		self.peerConnection.createOffer(onOfferCreated, generalFailureCallback);
	}

	/* Step 1I of the peering process: prepare an offer and send it to bootstrap server */
	var onOfferCreated = function(offer) {
		self.peerConnection.setLocalDescription(offer);
		self.channel.send(new p2pPacket('peering', new peeringPacket(offer, client.id, self.localPort)));
	}
	
	/* Step 2I of the peering process: take the answer received and instantiate a datachannel */
	var onPeeringReply = function(reply) {
		retrievedPeerId = reply.body.originator;

		if(reply.body.answer) {
			self.peerConnection.setRemoteDescription(reply.body.answer, connectToPeer);
			self.remotePort = reply.body.port;
		}
		else
			onPeerFound();
	}

	/* Step 3I of the peering process: connect to peer */
	var connectToPeer = function() {
		self.peerConnection.connectDataConnection(self.localPort, self.remotePort);
	}	
	
	this.channel.on('peeringReply', onPeeringReply);
	this.peerConnection = new mozRTCPeerConnection();

	/* Step 4I of the peering process: save data channel as new wrapped channel */
	this.peerConnection.onconnection = function() {
		self.channel.connectViaSocket(self.peerConnection.createDataChannel("Reliable data channel :)",{}), retrievedPeerId);
		onPeerFound();
	}

	navigator.mozGetUserMedia({audio:true, fake:true}, onFakeStreamDone, generalFailureCallback);	
}

Peer.prototype.send = function(packet) {
	this.channel.send(packet);	
}

var generalFailureCallback = function(errorMessage) {
	throw errorMessage
}

exports.Peer = window.Peer = Peer;

});

require.define("/channel.js",function(require,module,exports,__dirname,__filename,process,global){var Channel = function() {
	this.wrappedChannel = null;
}

Channel.prototype.send = null;

Channel.prototype.connectByName = function(serverAddress, onConnect) {
	this.wrappedChannel = new WebSocket(serverAddress);
	this.wrappedChannel.onopen = onConnect;
	configureSocket(this);	
}

Channel.prototype.connectViaSocket = function(peerSocket, id) {
	this.wrappedChannel = peerSocket;				
	configureSocket(this, id);
}

Channel.prototype.on = function(eventName, callback) {
	this[eventName] = callback;
}

var configureSocket = function(channel, peerID) {
	var messageCallback = function(message, flags) {
		if(flags)
			message = new p2pPacket().compile(message);
		else
			message = new p2pPacket().compile(message.data);
			
		if(message.type && message.body)
			channel[message.type].call(channel, message);
	}

	var disconnectCallback = function() {
		client.pool.deleteConnectionByName(peerID);
		console.log('Client ' + peerID + ' disconnected!');
	}

	if((typeof WebSocket != 'undefined' && channel.wrappedChannel instanceof WebSocket) || 
			(typeof DataChannel != 'undefined' && channel.wrappedChannel instanceof DataChannel)) {
		channel.wrappedChannel.onmessage = messageCallback;
		channel.wrappedChannel.onclose = disconnectCallback;
	}
	else {
		channel.wrappedChannel.on('message', messageCallback);
		channel.wrappedChannel.on('close', disconnectCallback);
	}

	channel.send = function(pkt) {
		pkt.addIDToPath(client.id);
		channel.wrappedChannel.send(pkt.toString());
	}

}

exports.Channel = window.Channel = Channel;

});

require.define("/p2pPacket.js",function(require,module,exports,__dirname,__filename,process,global){var p2pPacket = function(currentType, currentBody) {
	this.type = currentType;
	this.body = currentBody;
	this.path = [];
	
}

p2pPacket.prototype.addIDToPath = function(id) {
    this.path.push(id);
}

p2pPacket.prototype.removeIDFromPath = function() {
    this.path.pop();
}

p2pPacket.prototype.toString = function() {
	return JSON.stringify(this);
}

p2pPacket.prototype.compile = function(packet) {
	packet = JSON.parse(packet);
	this.type = packet.type;
	this.body = packet.body;
	this.path = packet.path;

	return this;
}

exports.p2pPacket = window.p2pPacket = p2pPacket;

});

require.define("/peeringPacket.js",function(require,module,exports,__dirname,__filename,process,global){var peeringPacket = function(currentOffer, from, port) {
	this.offer = currentOffer;
	this.originator = from;
	this.port = port;
}


exports.peeringPacket = window.peeringPacket = peeringPacket;

});

require.define("/peeringReplyPacket.js",function(require,module,exports,__dirname,__filename,process,global){var peeringReplyPacket = function(currentAnswer, from, port) {
	this.answer = currentAnswer;	
	this.originator = from;
	this.port = port;
}

exports.peeringReplyPacket = window.peeringReplyPacket = peeringReplyPacket;

});

require.define("/setIdPacket.js",function(require,module,exports,__dirname,__filename,process,global){var setIdPacket = function(id) {
	this.id = id;	
}


exports.setIdPacket = window.setIdPacket = setIdPacket;

});

require.define("/client.js",function(require,module,exports,__dirname,__filename,process,global){var connectionPool = require('./connectionPool').connectionPool;
var Peer = require('./peer').Peer;

var Client = {

	pool : new connectionPool(),
	
	id : null,

	bootstrap : function() {
		var self = this;

		var onBSSReady = function() {
			currentPeer.lookForAPeer(self.onPeerFound);
			console.log('BSS Ready');
		}

		var currentPeer = new Peer('ws://p2pwebsharing.dyndns.biz', onBSSReady);
	},

	onPeering : function(receivedPeeringPacket, callingPeer) {
		var self = this;
		if((this.pool.usedConnections < this.pool.size) && !this.pool.exists(receivedPeeringPacket.body.originator) && receivedPeeringPacket.path.length == 1) {
			var onConnectionPerformed = function() {
				self.pool.pushConnection(receivedPeeringPacket.body.originator, acceptedPeer);				
			}

			var acceptedPeer = new Peer();
			acceptedPeer.createSocketForPeer(receivedPeeringPacket, callingPeer, onConnectionPerformed);
		}
	},

	onPeerFound : function() {
		console.log('new peer found!');
	}


}

exports.client = window.client = Client;

});
require("/client.js");
})();
