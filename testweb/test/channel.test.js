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
		done();
	});
	
	it('Should have a wrapped channel', function(done) {
		thisChannel.should.have.property('wrappedChannel');
		done();
	});
	
	it('Should have a way to connect to a server passing the address', function(done) {
		var innerTestFunction = function() {
			assert(thisChannel.wrappedChannel!=null);
			done();
		}
		thisChannel.should.have.property('connectByName');
		thisChannel.connectByName('http://p2pwebsharing.herokuapp.com', innerTestFunction);
	});
	
	it('Should be able to send messages', function(done) {
		var onReplyReceived = function(reply) {
			assert(reply==='cacca');
			done();
		}
		var innerTestFunction = function() {
			thisChannel.send('cacca', onReplyReceived);
		}
		thisChannel.should.have.property('send');
		thisChannel.connectByName('http://echotestserver.herokuapp.com', innerTestFunction);
	});
	
	it('Should throw an exception if user tries to send a message before he connects', function(done) {
		try {
			thisChannel.send('cacca', function(reply){});
		}
		catch(err) {
			done();
		}
	});
	
	it('Should have a peer connection object', function(done) {
		thisChannel.should.have.property('peerConnection');
		done();
	});

	it('Should be able to create offer', function(done) {
		var onOfferCreated = function(createdOffer) {
			assert(createdOffer!=null);
			done();
		}
		thisChannel.getNewOffer(onOfferCreated);
	});
});
