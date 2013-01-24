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
var templatesFolder = pagesFolder + "templates/";

// branch v11
app.use(express.bodyParser());

app.configure(function () {
	// Show Errors Oppan Java Style
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	
	// Static Files Folder : hello CSS!
	app.use(app.router);
	//app.use(express.static(__dirname + '/public'));
	app.use(express.static(pagesFolder));
	//app.use(express.template(templatesFolder));
	
	app.use(express.cookieParser());
	app.use(express.methodOverride());
});

app.get('/', function(request, response) {
	response.setHeader("Content-Type", "text/html");
	response.sendfile(pagesFolder + "index.html");
});

app.get('/nodepage.html', function(request, response) {
	response.setHeader("Content-Type", "text/html");
	
	var serverList = [];
	serverList.push('ws://www.ufojs.com');
	serverList.push('ws://ufojs.dyndns.biz');
	
	client.keys('*', function(err, keys) {
		if(keys.length == 0) {
			console.log('no element inside redis');
			serverList.push('No more servers under mind control!');
			response.render(templatesFolder + "nodepage.ejs", { 'serverList' : serverList });
		} else {
			keys.forEach(function(key, index, array) {
				client.get(key, function(err, res) {
					//console.log('http://' + JSON.parse(res).ip);
					serverList.push('http://' + JSON.parse(res).ip + ':' + JSON.parse(res).port);
					serverList.push('http://' + JSON.parse(res).ip);
					if(index == keys.length -1) {
						response.render(templatesFolder + "nodepage.ejs", { 'serverList' : serverList });
					}
				});
			});
		}
	});
});

app.post('/nodepage.html', function(request, response) {
	response.setHeader("Content-Type", "text/html");
	response.setHeader("Access-Control-Allow-Origin", "*");
	
	console.log(request.body);
	
	console.log(request.body.id != null);
	console.log(request.body.addr != null);
	console.log(request.body.port != null);
	console.log(request.body.isalive != null);
	
	// check if every required field is present inside the publish POST request
	if(request.body.id != null && request.body.addr != null && request.body.port != null) {
		
		// check if id is inside redis already
		client.get(request.body.id, function(err, resp) {
			if(resp) {
				//console.log('already present!');
				response.send('Someone with your ID is already under our mind control!');
			} else {
				var newEntry = { 'ip' : request.body.addr.toString(), 'port' : request.body.port.toString() };
				client.set(request.body.id, JSON.stringify(newEntry), function(err, resp) {
					client.expire(request.body.id, 300);
					//console.log('New entry in database: ' + request.body.id + ' on ip ' + newEntry.ip + ' and port ' + newEntry.port);
					response.send('Good job dude! Your stuff is ' + request.body.id + " " + request.body.addr + " " + request.body.port);
				});
			}
		});
	} else if(request.body.id != null && request.body.isalive != null) {
		response.send('This is a refresh request, isn\' it?');
	} else {
		response.send('No way! Gimme some info about you!');
	}

});

app.post('isalive.html', function(request, response) {
	console.log('TTL update request received');
	response.setHeader("Content-Type", "text/html");
	response.setHeader("Access-Control-Allow-Origin", "*");
	
	if(request.body.id != 'null' && request.body.isalive != 'null') {
		client.expire(request.body.id, 300, function(err, res) {
			console.log('TTL for ' + request.body.id + ' correctly updated');
			response.send('Heartbeat received and TTL updated!');
		});
	} else {
		response.send('Invalid heartbeat!');
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