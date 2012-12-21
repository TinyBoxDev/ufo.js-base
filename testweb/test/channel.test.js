/*
	Test suite for channel.js
*/

describe('Channel:\n', function(){
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
		if(thisChannel.wrappedChannel)
			thisChannel.wrappedChannel.disconnect();
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
		thisChannel.connectByName('http://p2pwebsharing.herokuapp.com', checkChannel);
	});
	
	/* Due a bug into socket.io client, I can't connect twice to the same server!
	it('Should be able to send messages', function(done) {
		var sendMessage = function() {
			thisChannel.send('cacca');
			done();
		}
		thisChannel.should.have.property('send');
		thisChannel.connectByName('http://echotestserver.herokuapp.com', sendMessage);
	});
	*/

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
			thisChannel.send(new p2pPacket('cacca', 'caccabody'));			
		}
		thisChannel.on('cacca', onReplyReceived);
		thisChannel.connectByName('http://echotestserver.herokuapp.com', sendMessage);
	});
	
});
