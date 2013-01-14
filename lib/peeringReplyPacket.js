var peeringReplyPacket = function(from) {
	this.originator = from;
	
	this.isAnswerPresent = false;
	
	this.O_NUMBER = null;
	this.LO_ADDR = null;
	this.PORT_NUMBER = null;
	this.EXTERNAL_ADDR = null;
	//this.CANDIDATE_ID_1 = null;
	//this.CANDIDATE_ID_2 = null;
	//this.CANDIDATE_TYPE_1 = null;
	//this.CANDIDATE_TYPE_2 = null;
	//this.CANDIDATE_NUMBER_1 = null;
	//this.CANDIDATE_NUMBER_2 = null;
	//this.LOCAL_ADDR = null;
	this.FRAGMENT = null;
	this.PWD = null;
	this.TOKEN = null;
	this.SSRC_NUMBER = null;
	this.SSRC_CNAME = null;
	
	this.c1 = null;
	this.c2 = null;
	
	
}

peeringReplyPacket.prototype.fromAnswer = function(offer) {
	var separatedOffer = offer.sdp.split('\r\n');
	
	var tempArray = separatedOffer[1].split('o=- ')[1].split(' 2 IN IP4 ');
	this.O_NUMBER = tempArray[0];
	this.LO_ADDR = tempArray[1];
	
	this.PORT_NUMBER = separatedOffer[6].split('m=application ')[1].split(' RTP/SAVPF 101')[0];
	this.EXTERNAL_ADDR = separatedOffer[7].split('c=IN IP4 ')[1];
	
	tempArray = separatedOffer[9].split('a=candidate:')[1].split(' ');
	//this.CANDIDATE_ID_1 = tempArray[0];
	//this.CANDIDATE_TYPE_1 = tempArray[2];
	//this.CANDIDATE_NUMBER_1 = tempArray[3];
	//this.LOCAL_ADDR = tempArray[4];
	
	this.c1 = separatedOffer[9].split('a=candidate:')[1];
	this.c2 = separatedOffer[10].split('a=candidate:')[1];
	
	//tempArray = separatedOffer[10].split('a=candidate:')[1].split(' ');
	//this.CANDIDATE_ID_2 = tempArray[0];
	//this.CANDIDATE_TYPE_2 = tempArray[2];
	//this.CANDIDATE_NUMBER_2 = tempArray[3];
	
	this.FRAGMENT = separatedOffer[11].split('a=ice-ufrag:')[1];
	this.PWD = separatedOffer[12].split('a=ice-pwd:')[1];
	this.TOKEN = separatedOffer[17].split('a=crypto:0 AES_CM_128_HMAC_SHA1_80 inline:')[1];
	
	tempArray = separatedOffer[19].split('a=ssrc:')[1].split(' cname:');
	this.SSRC_NUMBER = tempArray[0];
	this.SSRC_CNAME = tempArray[1];
	
	this.isAnswerPresent = true;
	
	return this;
}

peeringReplyPacket.prototype.toAnswer = function() {
	var stringSDP = 'v=0\r\no=- ' + this.O_NUMBER + ' 2 IN IP4 ' + this.LO_ADDR + '\r\ns=-\r\nt=0 0\r\na=group:BUNDLE data\r\na=msid-semantic: WMS\r\nm=application ' + this.PORT_NUMBER + ' RTP/SAVPF 101\r\nc=IN IP4 ' + this.EXTERNAL_ADDR + '\r\na=rtcp: 1 IN IP4 0.0.0.0\r\na=candidate:' + this.c1 + '\r\na=candidate:' + this.c2 + '\r\na=ice-ufrag:' + this.FRAGMENT + '\r\na=ice-pwd:' + this.PWD + '\r\na=sendrecv\r\na=mid:data\r\nb=AS:30\r\na=rtcp-mux\r\na=crypto:0 AES_CM_128_HMAC_SHA1_80 inline:' + this.TOKEN+ '\r\na=rtpmap:101 google-data/90000\r\na=ssrc:' + this.SSRC_NUMBER + ' cname:' + this.SSRC_CNAME + '\r\na=ssrc:' + this.SSRC_NUMBER + ' msid:datachannel d0\r\na=ssrc:' + this.SSRC_NUMBER + ' mslabel:datachannel\r\na=ssrc:' + this.SSRC_NUMBER + ' label:datachanneld0\r\n';
	
	return new RTCSessionDescription({ type : 'answer', sdp : stringSDP });
}

peeringReplyPacket.prototype.fill = function(packet) {
	this.originator = packet.originator;
	
	this.O_NUMBER = packet.O_NUMBER;
	this.LO_ADDR = packet.LO_ADDR;
	this.PORT_NUMBER = packet.PORT_NUMBER;
	this.EXTERNAL_ADDR = packet.EXTERNAL_ADDR;
	//this.CANDIDATE_ID_1 = packet.CANDIDATE_ID_1;
	//this.CANDIDATE_ID_2 = packet.CANDIDATE_ID_2;
	//this.CANDIDATE_TYPE_1 = packet.CANDIDATE_TYPE_1;
	//this.CANDIDATE_TYPE_2 = packet.CANDIDATE_TYPE_2;
	//this.CANDIDATE_NUMBER_1 = packet.CANDIDATE_NUMBER_1;
	//this.CANDIDATE_NUMBER_2 = packet.CANDIDATE_NUMBER_2;
	//this.LOCAL_ADDR = packet.LOCAL_ADDR;
	this.c1 = packet.c1;
	this.c2 = packet.c2;
	this.FRAGMENT = packet.FRAGMENT;
	this.PWD = packet.PWD;
	this.TOKEN = packet.TOKEN;
	this.SSRC_NUMBER = packet.SSRC_NUMBER;
	this.SSRC_CNAME = packet.SSRC_CNAME;
	
	this.isAnswerPresent = packet.isAnswerPresent;
	
	return this;
}

exports.peeringReplyPacket = window.peeringReplyPacket = peeringReplyPacket;
