var peeringPacket = function(from) {
	this.originator = from;
	
	this.O_NUMBER = null;
	this.LO_ADDR = null;
	this.PORT_NUMBER = null;
	this.EXTERNAL_ADDR = null;
	//this.LOCAL_ADDR = null;
	this.FRAGMENT = null;
	this.PWD = null;
	this.TOKEN = null;
	this.SSRC_NUMBER = null;
	this.SSRC_CNAME = null;
	
	//this.c0 = null;
	//this.c1 = null;
	//this.c2 = null;
	//this.c3 = null;
	
	this.cds = [];
		
}

peeringPacket.prototype.fromOffer = function(offer) {
	var separatedOffer = offer.sdp.split('\r\n');
	
	var tempArray = separatedOffer[1].split('o=- ')[1].split(' 2 IN IP4 ');
	this.O_NUMBER = tempArray[0];
	this.LO_ADDR = tempArray[1];
	
	this.PORT_NUMBER = separatedOffer[6].split('m=application ')[1].split(' RTP/SAVPF 101')[0];
	this.EXTERNAL_ADDR = separatedOffer[7].split('c=IN IP4 ')[1];
	
	this.FRAGMENT = separatedOffer[9].split('a=ice-ufrag:')[1];
	this.PWD = separatedOffer[10].split('a=ice-pwd:')[1];
	this.TOKEN = separatedOffer[16].split('a=crypto:0 AES_CM_128_HMAC_SHA1_80 inline:')[1];
	
	tempArray = separatedOffer[18].split('a=ssrc:')[1].split(' cname:');
	this.SSRC_NUMBER = tempArray[0];
	this.SSRC_CNAME = tempArray[1];
	
	return this;
}

peeringPacket.prototype.toOffer = function() {
	var stringSDP = 'v=0\r\n' + 
		'o=- ' + this.O_NUMBER + ' 2 IN IP4 ' + this.LO_ADDR + '\r\n' +
		's=-\r\n' + 
		't=0 0\r\n' + 
		'a=group:BUNDLE data\r\n' + 
		'a=msid-semantic: WMS\r\n' + 
		'm=application ' + this.PORT_NUMBER + ' RTP/SAVPF 101\r\n' + 
		'c=IN IP4 ' + this.EXTERNAL_ADDR + '\r\n' + 
		'a=rtcp:' + this.PORT_NUMBER + ' IN IP4 ' + this.EXTERNAL_ADDR + '\r\n';
		
		for(var i = 0; i < this.cds.length; i++) {
			stringSDP += this.cds[i];
		}
		
		stringSDP += 'a=ice-ufrag:' + this.FRAGMENT + '\r\n' + 
		'a=ice-pwd:' + this.PWD + '\r\n' + 
		'a=ice-options:google-ice\r\n' + 
		'a=sendrecv\r\n' + 
		'a=mid:data\r\n' + 
		'b=AS:30\r\n' + 
		'a=rtcp-mux\r\n' + 
		'a=crypto:0 AES_CM_128_HMAC_SHA1_80 inline:' + this.TOKEN+ '\r\n' + 
		'a=rtpmap:101 google-data/90000\r\n' + 
		'a=ssrc:' + this.SSRC_NUMBER + ' cname:' + this.SSRC_CNAME + '\r\n' + 
		'a=ssrc:' + this.SSRC_NUMBER + ' msid:datachannel d0\r\n' + 
		'a=ssrc:' + this.SSRC_NUMBER + ' mslabel:datachannel\r\n' + 
		'a=ssrc:' + this.SSRC_NUMBER + ' label:datachanneld0\r\n';
		
		console.log(stringSDP);
	
	return new RTCSessionDescription({ type : 'offer', sdp : stringSDP });
}

peeringPacket.prototype.fill = function(packet) {
	this.originator = packet.originator;
	
	this.O_NUMBER = packet.O_NUMBER;
	this.LO_ADDR = packet.LO_ADDR;
	this.PORT_NUMBER = packet.PORT_NUMBER;
	this.EXTERNAL_ADDR = packet.EXTERNAL_ADDR;
	this.cds = packet.cds;
	this.LOCAL_ADDR = packet.LOCAL_ADDR;
	this.FRAGMENT = packet.FRAGMENT;
	this.PWD = packet.PWD;
	this.TOKEN = packet.TOKEN;
	this.SSRC_NUMBER = packet.SSRC_NUMBER;
	this.SSRC_CNAME = packet.SSRC_CNAME;
	
	return this;
}


exports.peeringPacket = window.peeringPacket = peeringPacket;
