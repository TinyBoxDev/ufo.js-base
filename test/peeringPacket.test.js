/*
	Test suite for peeringPacket.js
*/


describe('Peering Packet:\n', function(){
	var thisPeeringPacket = null;
	
	before(function(done){
		done();
	});
	
	after(function(done){
		done();
	});
	
	beforeEach(function(done){
		thisPeeringPacket = new peeringPacket(null);
		done();
	});

	afterEach(function(done){
		done();
	});
		
	it('Should have a originator field', function(done) {
		thisPeeringPacket.should.have.property('originator');
		done();
	});
	
	it('Should compile from sdpString', function(done) {
		var sdpString = "v=0\r\no=- 3415709542 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE data\r\na=msid-semantic: WMS\r\nm=application 60672 RTP/SAVPF 101\r\nc=IN IP4 2.232.246.114\r\na=rtcp:60672 IN IP4 2.232.246.114\r\na=candidate:2222700650 1 udp 2113937151 192.168.1.105 60672 typ host generation 0\r\na=candidate:2222700650 2 udp 2113937151 192.168.1.105 60672 typ host generation 0\r\na=candidate:87277278 1 udp 1845501695 2.232.246.114 60672 typ srflx raddr 192.168.1.105 rport 60672 generation 0\r\na=candidate:87277278 2 udp 1845501695 2.232.246.114 60672 typ srflx raddr 192.168.1.105 rport 60672 generation 0\r\na=ice-ufrag:nCmQnJXtKf0Jg3AB\r\na=ice-pwd:tyrKoWbcbWmf4e/ovFVOXa+J\r\na=ice-options:google-ice\r\na=sendrecv\r\na=mid:data\r\nb=AS:30\r\na=rtcp-mux\r\na=crypto:0 AES_CM_128_HMAC_SHA1_80 inline:1LS7dMEu0CNi0sl6cFaO9zrsTNmYbFUFR7mYNc93\r\na=rtpmap:101 google-data/90000\r\na=ssrc:540794518 cname:OySNHlQZXlFG+kAe\r\na=ssrc:540794518 msid:datachannel d0\r\na=ssrc:540794518 mslabel:datachannel\r\na=ssrc:540794518 label:datachanneld0\r\n";
		
		var testPacket = new peeringPacket();
		testPacket = testPacket.fromOffer({ 'sdp' : sdpString});
		assert(testPacket.O_NUMBER == '3415709542');
		assert(testPacket.LO_ADDR == '127.0.0.1');
		assert(testPacket.PORT_NUMBER == '60672');
		assert(testPacket.EXTERNAL_ADDR == '2.232.246.114');
		//assert(testPacket.CANDIDATE_ID_1 == '2222700650');
		//assert(testPacket.CANDIDATE_ID_2 == '87277278');
		//assert(testPacket.CANDIDATE_TYPE_1 == 'udp');
		//assert(testPacket.CANDIDATE_TYPE_2 == 'udp');
		//assert(testPacket.CANDIDATE_NUMBER_1 == '2113937151');
		//assert(testPacket.CANDIDATE_NUMBER_2 == '1845501695');
		assert(testPacket.LOCAL_ADDR == '192.168.1.105');
		assert(testPacket.FRAGMENT == 'nCmQnJXtKf0Jg3AB');
		assert(testPacket.PWD == 'tyrKoWbcbWmf4e/ovFVOXa+J');
		assert(testPacket.TOKEN == '1LS7dMEu0CNi0sl6cFaO9zrsTNmYbFUFR7mYNc93');
		assert(testPacket.SSRC_NUMBER == '540794518');
		assert(testPacket.SSRC_CNAME == 'OySNHlQZXlFG+kAe');
		
		done();
	});
	
	it('Should create an offer from inner fileds', function(done) {
		var sdpString = "v=0\r\no=- 3415709542 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE data\r\na=msid-semantic: WMS\r\nm=application 60672 RTP/SAVPF 101\r\nc=IN IP4 2.232.246.114\r\na=rtcp:60672 IN IP4 2.232.246.114\r\na=candidate:2222700650 1 udp 2113937151 192.168.1.105 60672 typ host generation 0\r\na=candidate:2222700650 2 udp 2113937151 192.168.1.105 60672 typ host generation 0\r\na=candidate:87277278 1 udp 1845501695 2.232.246.114 60672 typ srflx raddr 192.168.1.105 rport 60672 generation 0\r\na=candidate:87277278 2 udp 1845501695 2.232.246.114 60672 typ srflx raddr 192.168.1.105 rport 60672 generation 0\r\na=ice-ufrag:nCmQnJXtKf0Jg3AB\r\na=ice-pwd:tyrKoWbcbWmf4e/ovFVOXa+J\r\na=ice-options:google-ice\r\na=sendrecv\r\na=mid:data\r\nb=AS:30\r\na=rtcp-mux\r\na=crypto:0 AES_CM_128_HMAC_SHA1_80 inline:1LS7dMEu0CNi0sl6cFaO9zrsTNmYbFUFR7mYNc93\r\na=rtpmap:101 google-data/90000\r\na=ssrc:540794518 cname:OySNHlQZXlFG+kAe\r\na=ssrc:540794518 msid:datachannel d0\r\na=ssrc:540794518 mslabel:datachannel\r\na=ssrc:540794518 label:datachanneld0\r\n";
		
		thisPeeringPacket.fromOffer({ 'sdp' : sdpString});
		
		console.log(sdpString);
		
		var result = thisPeeringPacket.toOffer();
		console.log(result.sdp);
		assert(sdpString==result.sdp);
		done();
	});
});
