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
		var sdpString = "
		v=0\r\n
		o=- 3415709542 2 IN IP4 127.0.0.1\r\n
		s=-\r\n
		t=0 0\r\n
		a=group:BUNDLE data\r\n
		a=msid-semantic: WMS\r\n
		m=application 60672 RTP/SAVPF 101\r\n
		c=IN IP4 2.232.246.114\r\n
		a=rtcp:60672 IN IP4 2.232.246.114\r\n
		a=candidate:2222700650 1 udp 2113937151 192.168.1.105 60672 typ host generation 0\r\n
		a=candidate:2222700650 2 udp 2113937151 192.168.1.105 60672 typ host generation 0\r\n
		a=candidate:87277278 1 udp 1845501695 2.232.246.114 60672 typ srflx raddr 192.168.1.105 rport 60672 generation 0\r\n
		a=candidate:87277278 2 udp 1845501695 2.232.246.114 60672 typ srflx raddr 192.168.1.105 rport 60672 generation 0\r\n
		a=ice-ufrag:nCmQnJXtKf0Jg3AB\r\n
		a=ice-pwd:tyrKoWbcbWmf4e/ovFVOXa+J\r\n
		a=ice-options:google-ice\r\n
		a=sendrecv\r\n
		a=mid:data\r\n
		b=AS:30\r\n
		a=rtcp-mux\r\n
		a=crypto:0 AES_CM_128_HMAC_SHA1_80 inline:1LS7dMEu0CNi0sl6cFaO9zrsTNmYbFUFR7mYNc93\r\n
		a=rtpmap:101 google-data/90000\r\n
		a=ssrc:540794518 cname:OySNHlQZXlFG+kAe\r\n
		a=ssrc:540794518 msid:datachannel d0\r\n
		a=ssrc:540794518 mslabel:datachannel\r\n
		a=ssrc:540794518 label:datachanneld0\r\n";
		
		var testPacket = new peeringPacket();
		testPacket = testPacket.fromOffer({ 'sdp' : sdpString});
		assert(testPacket.O_NUMBER == '3415709542');
		assert(testPacket.LO_ADDR == '127.0.0.1');
		assert(testPacket.PORT_NUMBER == '60672');
		assert(testPacket.EXTERNAL_ADDR == '2.232.246.114');
		assert(testPacket.LOCAL_ADDR == '192.168.1.105');
		assert(testPacket.FRAGMENT == 'nCmQnJXtKf0Jg3AB');
		assert(testPacket.PWD == 'tyrKoWbcbWmf4e/ovFVOXa+J');
		assert(testPacket.TOKEN == '1LS7dMEu0CNi0sl6cFaO9zrsTNmYbFUFR7mYNc93');
		assert(testPacket.SSRC_NUMBER == '540794518');
		assert(testPacket.SSRC_CNAME == 'OySNHlQZXlFG+kAe');
		assert(testPacket.CANDIDATE_11 == 'a=candidate:2222700650 1 udp 2113937151 192.168.1.105 60672 typ host generation 0');
		assert(testPacket.CANDIDATE_12 == 'a=candidate:2222700650 2 udp 2113937151 192.168.1.105 60672 typ host generation 0');
		assert(testPacket.CANDIDATE_21 == 'a=candidate:87277278 1 udp 1845501695 2.232.246.114 60672 typ srflx raddr 192.168.1.105 rport 60672 generation 0');
		assert(testPacket.CANDIDATE_22 == 'a=candidate:87277278 2 udp 1845501695 2.232.246.114 60672 typ srflx raddr 192.168.1.105 rport 60672 generation 0');
		
		done();
	});
	
	it('Should create an offer from inner fileds', function(done) {
		var sdpString = "
		v=0\r\n
		o=- 3415709542 2 IN IP4 127.0.0.1\r\n
		s=-\r\n
		t=0 0\r\n
		a=group:BUNDLE data\r\n
		a=msid-semantic: WMS\r\n
		m=application 60672 RTP/SAVPF 101\r\n
		c=IN IP4 2.232.246.114\r\n
		a=rtcp:60672 IN IP4 2.232.246.114\r\n
		a=candidate:2222700650 1 udp 2113937151 192.168.1.105 60672 typ host generation 0\r\n
		a=candidate:2222700650 2 udp 2113937151 192.168.1.105 60672 typ host generation 0\r\n
		a=candidate:87277278 1 udp 1845501695 2.232.246.114 60672 typ srflx raddr 192.168.1.105 rport 60672 generation 0\r\n
		a=candidate:87277278 2 udp 1845501695 2.232.246.114 60672 typ srflx raddr 192.168.1.105 rport 60672 generation 0\r\n
		a=ice-ufrag:nCmQnJXtKf0Jg3AB\r\n
		a=ice-pwd:tyrKoWbcbWmf4e/ovFVOXa+J\r\n
		a=ice-options:google-ice\r\n
		a=sendrecv\r\n
		a=mid:data\r\n
		b=AS:30\r\n
		a=rtcp-mux\r\n
		a=crypto:0 AES_CM_128_HMAC_SHA1_80 inline:1LS7dMEu0CNi0sl6cFaO9zrsTNmYbFUFR7mYNc93\r\n
		a=rtpmap:101 google-data/90000\r\n
		a=ssrc:540794518 cname:OySNHlQZXlFG+kAe\r\n
		a=ssrc:540794518 msid:datachannel d0\r\n
		a=ssrc:540794518 mslabel:datachannel\r\n
		a=ssrc:540794518 label:datachanneld0\r\n";
		
		thisPeeringPacket.fromOffer({ 'sdp' : sdpString});
		
		console.log(sdpString);
		
		var result = thisPeeringPacket.toOffer();
		console.log(result.sdp);
		assert(sdpString==result.sdp);
		done();
	});
});
