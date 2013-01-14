var peeringPacket = function(from) {
	this.originator = from;
	
	this.O_NUMBER = null;
	this.LO_ADDR = null;
	this.PORT_NUMBER = null;
	this.EXTERNAL_ADDR = null;
	this.CANDIDATE_ID_1 = null;
	this.CANDIDATE_ID_2 = null;
	this.CANDIDATE_TYPE_1 = null;
	this.CANDIDATE_TYPE_2 = null;
	this.CANDIDATE_NUMBER_1 = null;
	this.CANDIDATE_NUMBER_2 = null;
	this.LOCAL_ADDR = null;
	this.FRAGMENT = null;
	this.PWD = null;
	this.TOKEN = null;
	this.SSRC_NUMBER = null;
	this.SSRC_CNAME = null;
	
	
}

peeringPacket.prototype.fromOffer = function(offer) {
	var separatedOffer = offer.sdp.split('\r\n');
	
	var tempArray = separatedOffer[1].split('o=- ')[1].split(' 2 IN IP4 ');
	this.O_NUMBER = tempArray[0];
	this.LO_ADDR = tempArray[1];
	
	this.PORT_NUMBER = separatedOffer[6].split('m=application ')[1].split(' RTP/SAVPF 101')[0];
	this.EXTERNAL_ADDR = separatedOffer[7].split('c=IN IP4 ')[1];
	
	tempArray = separatedOffer[9].split('a=candidate:')[1].split(' ');
	this.CANDIDATE_ID_1 = tempArray[0];
	this.CANDIDATE_TYPE_1 = tempArray[2];
	this.CANDIDATE_NUMBER_1 = tempArray[3];
	this.LOCAL_ADDR = tempArray[4];
	
	tempArray = separatedOffer[11].split('a=candidate:')[1].split(' ');
	this.CANDIDATE_ID_2 = tempArray[0];
	this.CANDIDATE_TYPE_2 = tempArray[2];
	this.CANDIDATE_NUMBER_2 = tempArray[3];
	
	this.FRAGMENT = separatedOffer[13].split('a=ice-ufrag:')[1];
	this.PWD = separatedOffer[14].split('a=ice-pwd:')[1];
	this.TOKEN = separatedOffer[20].split('a=crypto:0 AES_CM_128_HMAC_SHA1_80 inline:')[1];
	
	tempArray = separatedOffer[22].split('a=ssrc:')[1].split(' cname:');
	this.SSRC_NUMBER = tempArray[0];
	this.SSRC_CNAME = tempArray[1];
	
	return this;
}

peeringPacket.prototype.toOffer = function() {
	var stringSDP = 'v=0\r\no=- ' + this.O_NUMBER + ' 2 IN IP4 ' + this.LO_ADDR + '\r\ns=-\r\nt=0 0\r\na=group:BUNDLE data\r\na=msid-semantic: WMS\r\nm=application ' + this.PORT_NUMBER + ' RTP/SAVPF 101\r\nc=IN IP4 ' + this.EXTERNAL_ADDR + '\r\na=rtcp:' + this.PORT_NUMBER + ' IN IP4 ' + this.EXTERNAL_ADDR + '\r\na=candidate:' + this.CANDIDATE_ID_1 +' 1 ' + this.CANDIDATE_TYPE_1 + ' ' + this.CANDIDATE_NUMBER_1 + ' ' + this.LOCAL_ADDR+ ' ' + this.PORT_NUMBER + ' typ host generation 0\r\na=candidate:' + this.CANDIDATE_ID_1 +' 2 ' + this.CANDIDATE_TYPE_1 + ' ' + this.CANDIDATE_NUMBER_1 + ' ' + this.LOCAL_ADDR + ' ' + this.PORT_NUMBER + ' typ host generation 0\r\na=candidate:' + this.CANDIDATE_ID_2 + ' 1 ' + this.CANDIDATE_TYPE_2 + ' ' + this.CANDIDATE_NUMBER_2 + ' ' + this.EXTERNAL_ADDR + ' ' + this.PORT_NUMBER + ' typ srflx raddr ' + this.LOCAL_ADDR + ' rport ' + this.PORT_NUMBER + ' generation 0\r\na=candidate:' + this.CANDIDATE_ID_2 + ' 2 ' + this.CANDIDATE_TYPE_2 + ' ' + this.CANDIDATE_NUMBER_2 + ' ' + this.EXTERNAL_ADDR + ' ' + this.PORT_NUMBER + ' typ srflx raddr ' + this.LOCAL_ADDR + ' rport ' + this.PORT_NUMBER + ' generation 0\r\na=ice-ufrag:' + this.FRAGMENT + '\r\na=ice-pwd:' + this.PWD + '\r\na=ice-options:google-ice\r\na=sendrecv\r\na=mid:data\r\nb=AS:30\r\na=rtcp-mux\r\na=crypto:0 AES_CM_128_HMAC_SHA1_80 inline:' + this.TOKEN+ '\r\na=rtpmap:101 google-data/90000\r\na=ssrc:' + this.SSRC_NUMBER + ' cname:' + this.SSRC_CNAME + '\r\na=ssrc:' + this.SSRC_NUMBER + ' msid:datachannel d0\r\na=ssrc:' + this.SSRC_NUMBER + ' mslabel:datachannel\r\na=ssrc:' + this.SSRC_NUMBER + ' label:datachanneld0\r\n';
	
	return new RTCSessionDescription({ type : 'offer', sdp : stringSDP });
}

peeringPacket.prototype.fill = function(packet) {
	this.originator = packet.originator;
	
	this.O_NUMBER = packet.O_NUMBER;
	this.LO_ADDR = packet.LO_ADDR;
	this.PORT_NUMBER = packet.PORT_NUMBER;
	this.EXTERNAL_ADDR = packet.EXTERNAL_ADDR;
	this.CANDIDATE_ID_1 = packet.CANDIDATE_ID_1;
	this.CANDIDATE_ID_2 = packet.CANDIDATE_ID_2;
	this.CANDIDATE_TYPE_1 = packet.CANDIDATE_TYPE_1;
	this.CANDIDATE_TYPE_2 = packet.CANDIDATE_TYPE_2;
	this.CANDIDATE_NUMBER_1 = packet.CANDIDATE_NUMBER_1;
	this.CANDIDATE_NUMBER_2 = packet.CANDIDATE_NUMBER_2;
	this.LOCAL_ADDR = packet.LOCAL_ADDR;
	this.FRAGMENT = packet.FRAGMENT;
	this.PWD = packet.PWD;
	this.TOKEN = packet.TOKEN;
	this.SSRC_NUMBER = packet.SSRC_NUMBER;
	this.SSRC_CNAME = packet.SSRC_CNAME;
	
	return this;
}


exports.peeringPacket = window.peeringPacket = peeringPacket;
