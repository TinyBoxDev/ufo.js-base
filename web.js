if(typeof window === 'undefined')
	window = global; // write once run everywhere

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var client = require('bsPeer').bspeer;

client.startServer(server);

app.configure(function () {
	// Show Errors Oppan Java Style
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	
	// Static Files Folder
	app.use(express.static(__dirname + '/public'));

});

app.get('/', function(request, response) {
	response.setHeader("Content-Type", "text/html");
	response.sendfile('index.html');
});

var port = process.env.PORT || 8080;
server.listen(port, function() {
  console.log("Listening on " + port);
});
