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
var stinkyAlien = require('bsPeer').bspeer;

stinkyAlien.startServer(server);

client.on("error", function (err) {
	console.log("Error " + err);
});

var pagesFolder = __dirname + "/public/";
var templatesFolder = __dirname + "/templates/";

// branch v11
app.use(express.bodyParser());
app.use(express.cookieParser());

app.configure(function () {
	// Show Errors Oppan Java Style
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	
	// Static Files Folder : hello CSS!
	app.use(app.router);
	app.use(express.static(pagesFolder));
	
	//app.use(express.cookieParser());
	app.use(express.methodOverride());
});

app.get('/', function(request, response) {
	response.setHeader("Content-Type", "text/html");
	response.sendfile(pagesFolder + "index.html");
});

app.get('/nodepage.html', function(request, response) {
	response.setHeader("Content-Type", "text/html");
	//response.setHeader("Access-Control-Allow-Origin", "*");
	
	console.log('Nodepage request received.');
	
	//if(request.cookies.assignedID == undefined) {
		console.log('Brand new cookie for you!');
		var assignedID = randomString(16, 'aA#');
		response.setHeader('Set-Cookie','assignedID=' + assignedID);
		//}
	
	var serverList = [];
	serverList.push('ws://www.ufojs.com');
	serverList.push('ws://localhost:8080');
	
	client.keys('*', function(err, keys) {
		if(keys.length == 0) {
			console.log('no element inside redis');
			serverList.push('No more servers under mind control!');
			response.render(templatesFolder + "nodepage.ejs", { 'serverList' : serverList });
		} else {
			keys.forEach(function(key, index, array) {
				client.get(key, function(err, res) {
					serverList.push('ws://' + JSON.parse(res).ip + ':' + JSON.parse(res).port);
					if(index == keys.length -1) {
						response.render(templatesFolder + "nodepage.ejs", { 'serverList' : serverList });
					}
				});
			});
		}
	});
});

app.post('/serverize', function(request, response) {
	response.setHeader("Content-Type", "text/html");
	//response.setHeader("Access-Control-Allow-Origin", "*");
	
	console.log('Serverize request received.');
	
	if(request.cookies.assignedID != undefined) {
		var newEntry = { 'ip' : request.connection.remoteAddress, 'port' : 9003 };
		client.set(request.cookies.assignedID, JSON.stringify(newEntry), function(err, resp) {
			client.expire(request.cookies.assignedID, 300);
			response.send('Good job dude! Your stuff is ' + JSON.stringify(newEntry));
		});
	} else {
		response.send('It seems that you don\'t have a cookie. Please retry.');
	}

});

app.post('/heartbeat', function(request, response) {
	response.setHeader("Content-Type", "text/html");
	//response.setHeader("Access-Control-Allow-Origin", "*");
	
	console.log('TTL update request received.');
	
	if(request.cookies.assignedID != undefined) {
		//var newEntry = { 'ip' : request.connection.remoteAddress, 'port' : request.connection.remotePort };
		var newEntry = { 'ip' : request.connection.remoteAddress, 'port' : 9003 };
		client.set(request.cookies.assignedID, JSON.stringify(newEntry), function(err, resp) {
			client.expire(request.cookies.assignedID, 300);
			response.send('Long life to you, human.');
		});
		
	} else {
		response.send('Cannot find you inside our powerful mainframe!');
	}
});

var port = process.env.PORT || 8080;
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