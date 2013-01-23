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

app.configure(function () {
	// Show Errors Oppan Java Style
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	
	// Static Files Folder : hello CSS!
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.get('/', function(request, response) {
	response.setHeader("Content-Type", "text/html");
	response.sendfile(pagesFolder + "index.html");
});

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
	var generatedID = randomString(16, '#aA');
	
	client.incr('id', function(error, id) {
		client.set('req' + id, generatedID, function() {
			console.log('Request saved on Redis');
		});
		client.expire('req' + id, 300);
	});
	
	var pendingClients = 0;
	var response;
	client.keys('*', function (err, keys) {
		response = keys;
		console.log(response);
	});
	pendingClients = response.length;
	
	response.setHeader("Content-Type", "text/html");
	response.setHeader("Set-Cookie", generatedID);
	response.render(templatesFolder + "baseTemplate.ejs", 
		{
			'time' : time,
			'connectedServer' : connectedServers,
			'pendingClients' : pendingClients,
			'serverList' : serverList,
			'generatedID' : generatedID,
			'callingIP' : remoteAddress
		});
});

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
