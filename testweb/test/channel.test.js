/*
	Test suite for channel.js
*/

describe('Channel:\n', function(){
	this.timeout(10000);	
	var thisChannel = null;

	before(function(done){
		done();
	});
	
	after(function(done){
//		if(!document.getElementById('ioscript')) {
//			var ioscript = document.createElement('script');
//			ioscript.src = "http://echotestserver.herokuapp.com/socket.io/socket.io.js";
//			ioscript.id = "ioscript"
//			document.getElementsByTagName('head')[0].appendChild(ioscript);
//		}
		done();
	});
	
	beforeEach(function(done){
//		if(!document.getElementById('ioscript')) {
//			var ioscript = document.createElement('script');
//			ioscript.src = "http://echotestserver.herokuapp.com/socket.io/socket.io.js";
//			ioscript.id = "ioscript"
//			document.getElementsByTagName('head')[0].appendChild(ioscript);
//		}
		thisChannel = new Channel.Channel();
//		setTimeout(done, 1000);
		done();
	});

	afterEach(function(done){
//		if(thisChannel && thisChannel.wrappedChannel) {
//			thisChannel.wrappedChannel.disconnect();						
//			var ioscript = document.getElementById('ioscript');
//			ioscript.parentNode.removeChild(ioscript);
//			var poolnode = document.getElementsByTagName('script')[0];
//			poolnode.parentNode.removeChild(poolnode);
//			var iosocketform = document.getElementsByClassName('socketio')[0];
//			if(iosocketform)
//				iosocketform.parentNode.removeChild(iosocketform);
//		}
		done();
	});
	
	it('Should have a wrapped channel', function(done) {
		thisChannel.should.have.property('wrappedChannel');
		done();
	});
	
	it('Should have a way to connect to a server passing the address', function(done) {
		var checkChannel = function() {
			assert(thisChannel.wrappedChannel!=null);
			done();			
		}
		thisChannel.should.have.property('connectByName');
		thisChannel.connectByName('http://echotestserver.herokuapp.com', checkChannel);
	});
	
	it('Should be able to send messages', function(done) {
		var sendMessage = function() {
			thisChannel.send('cacca');
			done();
		}
		thisChannel.should.have.property('send');
		thisChannel.connectByName('http://echotestserver.herokuapp.com', sendMessage);
	});
	

	it('Should throw an exception if user tries to send a message before he connects', function(done) {
		try {
			thisChannel.send('cacca');
		}
		catch(err) {
			done();
		}
	});

	it('Should be able to add callbacks', function(done){ 
		var onReplyReceived = function(reply) {
			assert(reply==='caccabody');
			done();
		}
		var sendMessage = function() {
			thisChannel.send(new p2pPacket.p2pPacket('cacca', 'caccabody'));			
		}
		thisChannel.on('cacca', onReplyReceived);
		thisChannel.connectByName('http://echotestserver.herokuapp.com', sendMessage);
	});

	it('Should be able to set a socket', function(done) {
		var testNewSocket = function(reply) {
			done();
		}	

		var onConnect = function() {
			thisChannel.connectViaSocket(newSocket);
			thisChannel.on('test', testNewSocket);
			thisChannel.send(new p2pPacket.p2pPacket('test', 'cacca'));	
		}

		var newSocket = io.connect('http://echotestserver.herokuapp.com');
		newSocket.on('connect', onConnect);
	});
	
});
