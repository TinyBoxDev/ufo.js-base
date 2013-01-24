/* Publish ufo.js network server.
 * Authors: Pasquale Boemio boemianrapsodi@gmail.com || Antonio Bevilacqua b3by.in.th3.sky@gmail.com
 */

if(typeof window === 'undefined')
	window = global; // write once run everywhere

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var redis = require('redis');
var client = redis.createClient();

client.on("error", function (err) {
	console.log("Error " + err);
});

var pagesFolder = __dirname + "/public/";
var templatesFolder = pagesFolder + "templates/";

// branch v11
app.use(express.bodyParser());

app.configure(function () {
	// Show Errors Oppan Java Style
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	
	// Static Files Folder : hello CSS!
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
	
	app.use(express.cookieParser());
	app.use(express.methodOverride());
});

app.get('/', function(request, response) {
	response.setHeader("Content-Type", "text/html");
	response.sendfile(pagesFolder + "index.html");
});

app.post('/nodepage.html', function(request, response) {
	response.setHeader("Content-Type", "text/html");
	
	if(request.body.id != 'null' && request.body.id != 'null' && request.body.port != 'null') {
		var newEntry = { 'ip' : request.body.addr.toString(), 'port' : request.body.port.toString() };
	
		client.set(request.body.id, JSON.stringify(newEntry), function() {
			client.expire(request.body.id, 300);
			console.log('New entry in database: ' + request.body.id + ' on ip ' + newEntry.ip + ' and port ' + newEntry.port);
			response.send('Good job dude! Your stuff is ' + request.body.id + " " + request.body.addr + " " + request.body.port);
		});
	} else {
		response.send('No way! Gimme some information about you!');
	}

});

app.get('/nodepage.html', function(request, response) {
	response.setHeader("Content-Type", "text/html");
	
	// STUB : server list has to come from redis client!
	var serverList = [];
	serverList[0] = 'http://www.ufojs.com/nodepage.html';
	serverList[1] = 'http://ufojs.dyndns.biz/nodepage.html';
	
	// STUB : get all the keys and load them to the page
	client.keys('*', function (err, keys) {
		for(var index = 0; index < keys.length; index++) {
		}
		response.render(templatesFolder + "nodepage.ejs",
			{
				'serverList' : serverList
			});
	});
});

/*
app.get('/publish.html', function(request, response) {
	
	var now = new Date();
	var mins = now.getMinutes();
	var hours = now.getHours();
	var time = hours + ':' + mins + '';
	
	// STUB : it will come from redis
	var serverList = [];
	serverList[0] = 'http://www.ufojs.com/nodepage.html';
	serverList[1] = 'http://ufojs.dyndns.biz/nodepage.html';
	var connectedServers = serverList.length;
	
	// STUB : saving request number
	var remoteAddress = request.connection.remoteAddress;
	var remotePort = request.connection.remotePort;
	var generatedID = randomString(16, '#aA');
	var pendingClients = 0;
	
	var toSave = { 'ip' : remoteAddress.toString(), 'port' : remotePort.toString() };
	
	client.set(generatedID, JSON.stringify(toSave), function() {
		client.expire(generatedID, 300);
	});
	
	client.keys('*', function (err, keys) {
		pendingClients = keys.length;
		response.render(templatesFolder + "baseTemplate.ejs", 
			{
				'time' : time,
				'connectedServer' : connectedServers,
				'pendingClients' : pendingClients,
				'serverList' : serverList,
				'generatedID' : generatedID,
				'callingIP' : remoteAddress,
				'remotePort' : remotePort
			});
		
	});
	
	response.setHeader("Content-Type", "text/html");
	//response.setHeader("Set-Cookie", generatedID);
	response.cookie('GEN_ID', generatedID, { expires: new Date(now + 300), httpOnly: false });
	
});
*/

var port = process.env.PORT || 9999;
server.listen(port, function() {
  console.log("Listening on " + port);
});

var randomString = function(length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:;\?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
    return result;
}