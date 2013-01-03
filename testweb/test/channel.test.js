/*
	Test suite for channel.js
*/

describe('Channel:\n', function(){
	this.timeout(15000);	
	var thisChannel = null;

	before(function(done){
		done();
	});
	
	after(function(done){
		done();
	});
	
	beforeEach(function(done){
		thisChannel = new Channel();
		done();
	});

	afterEach(function(done){
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
		thisChannel.connectByName('ws://helloiampau.echotestserver.jit.su/', checkChannel);
	});
	
	it('Should be able to send messages', function(done) {
		var sendMessage = function() {
			thisChannel.send('cacca');
			thisChannel.wrappedChannel.close();
			done();
		}
		thisChannel.should.have.property('send');
		thisChannel.connectByName('ws://helloiampau.echotestserver.jit.su/', sendMessage);
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
			thisChannel.wrappedChannel.close();			
			done();
		}
		var sendMessage = function() {
			thisChannel.send(new p2pPacket('cacca', 'caccabody'));			
		}
		thisChannel.on('cacca', onReplyReceived);
		thisChannel.connectByName('ws://helloiampau.echotestserver.jit.su/', sendMessage);
	});

	it('Should be able to set a socket', function(done) {
		var testNewSocket = function(reply) {
			thisChannel.wrappedChannel.close();			
			done();
		}	

		var onConnect = function() {
			thisChannel.connectViaSocket(newSocket);
			thisChannel.on('test', testNewSocket);
			thisChannel.send(new p2pPacket('test', 'cacca'));	
		}

		var newSocket = new WebSocket('ws://helloiampau.echotestserver.jit.su/');
		newSocket.onopen = onConnect;
	});
	
});
