/*
	Test suite for peeringReplyPacket.js
*/

describe('Peering Reply Packet:\n', function(){
	var thisPeeringReplyPacket = null;
	
	before(function(done){
		done();
	});
	
	after(function(done){
		done();
	});
	
	beforeEach(function(done){
		thisPeeringReplyPacket = new peeringReplyPacket(null);
		done();
	});

	afterEach(function(done){
		done();
	});
	
	it('Should compile from sdpString', function(done) {
		var sdpString = "
		v=0\r\n
		o=- O_NUMBER 2 IN IP4 LO_ADDRESS\r\n
		s=-\r\n
		t=0 0\r\n
		a=group:BUNDLE data\r\n
		a=msid-semantic: WMS\r\n
		m=application PORT_NUMBER RTP/SAVPF 101\r\n
		c=IN IP4 EXTERNAL_ADDRESS\r\n
		a=rtcp: 1 IN IP4 0.0.0.0\r\n
		a=candidate:CANDIDATE_ID_1 1 CANDIDATE_TYPE_1 CANDIDATE_NUMBER_1 LOCAL_ADDRESS PORT_NUMBER typ host generation 0\r\n
		a=candidate:CANDIDATE_ID_2 1 CANDIDATE_TYPE_2 CANDIDATE_NUMBER_2 EXTERNAL_ADDRESS PORT_NUMBER typ srflx raddr LOCAL_ADDRESS rport PORT_NUMBER generation 0\r\n
		a=ice-ufrag:FRAGMENT\r\n
		a=ice-pwd:PWD\r\n
		a=sendrecv\r\n
		a=mid:data\r\n
		b=AS:30\r\n
		a=rtcp-mux\r\n
		a=crypto:0 AES_CM_128_HMAC_SHA1_80 inline:TOKEN\r\n
		a=rtpmap:101 google-data/90000\r\n
		a=ssrc:SSRC_NUMBER cname:SSRC_CNAME\r\n
		a=ssrc:SSRC_NUMBER msid:datachannel d0\r\n
		a=ssrc:SSRC_NUMBER mslabel:datachannel\r\n
		a=ssrc:SSRC_NUMBER label:datachanneld0\r\n";
		
		var testPacket = new peeringReplyPacket();
		testPacket = testPacket.fromAnswer({ 'sdp' : sdpString});
		assert(testPacket.O_NUMBER == 'O_NUMBER');
		assert(testPacket.LO_ADDR == 'LO_ADDRESS');
		assert(testPacket.PORT_NUMBER == 'PORT_NUMBER');
		assert(testPacket.EXTERNAL_ADDR == 'EXTERNAL_ADDRESS');
		assert(testPacket.FRAGMENT == 'FRAGMENT');
		assert(testPacket.PWD == 'PWD');
		assert(testPacket.TOKEN == 'TOKEN');
		assert(testPacket.SSRC_NUMBER == 'SSRC_NUMBER');
		assert(testPacket.SSRC_CNAME == 'SSRC_CNAME');
		assert(testPacket.CANDIDATE_1 == 'a=candidate:CANDIDATE_ID_1 1 CANDIDATE_TYPE_1 CANDIDATE_NUMBER_1 LOCAL_ADDRESS PORT_NUMBER typ host generation 0');
		assert(testPacket.CANDIDATE_2 == 'a=candidate:CANDIDATE_ID_2 1 CANDIDATE_TYPE_2 CANDIDATE_NUMBER_2 EXTERNAL_ADDRESS PORT_NUMBER typ srflx raddr LOCAL_ADDRESS rport PORT_NUMBER generation 0');
		
		done();
	});
	
	it('Should create an offer from inner fileds', function(done) {
		var sdpString = "
		v=0\r\n
		o=- O_NUMBER 2 IN IP4 LO_ADDRESS\r\n
		s=-\r\n
		t=0 0\r\n
		a=group:BUNDLE data\r\n
		a=msid-semantic: WMS\r\n
		m=application PORT_NUMBER RTP/SAVPF 101\r\n
		c=IN IP4 EXTERNAL_ADDRESS\r\n
		a=rtcp: 1 IN IP4 0.0.0.0\r\n
		a=candidate:CANDIDATE_ID_1 1 CANDIDATE_TYPE_1 CANDIDATE_NUMBER_1 LOCAL_ADDRESS PORT_NUMBER typ host generation 0\r\n
		a=candidate:CANDIDATE_ID_2 1 CANDIDATE_TYPE_2 CANDIDATE_NUMBER_2 EXTERNAL_ADDRESS PORT_NUMBER typ srflx raddr LOCAL_ADDRESS rport PORT_NUMBER generation 0\r\n
		a=ice-ufrag:FRAGMENT\r\n
		a=ice-pwd:PWD\r\n
		a=sendrecv\r\n
		a=mid:data\r\n
		b=AS:30\r\na=rtcp-mux\r\n
		a=crypto:0 AES_CM_128_HMAC_SHA1_80 inline:TOKEN\r\n
		a=rtpmap:101 google-data/90000\r\n
		a=ssrc:SSRC_NUMBER cname:SSRC_CNAME\r\n
		a=ssrc:SSRC_NUMBER msid:datachannel d0\r\n
		a=ssrc:SSRC_NUMBER mslabel:datachannel\r\n
		a=ssrc:SSRC_NUMBER label:datachanneld0\r\n";
		
		thisPeeringReplyPacket.fromAnswer({ 'sdp' : sdpString});
		
		var result = thisPeeringReplyPacket.toAnswer();
		console.log(result.sdp);
		console.log(sdpString);
		assert(sdpString==result.sdp);
		done();
	});
});
