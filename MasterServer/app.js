/* CONFIG */
var config = require('./config.json');

/* 
	REQUIRES 
*/
var express = require('express');
var app = express();
var webserver = require('http').createServer(app);
var sessions = require('./lib/sessions.js');
var io = require('socket.io').listen(webserver);
var ioModules = require('socket.io').listen(config.module_port);
var os = require('os');
var fs = require('fs');
var dateFormat = require('dateformat');
var bodyParser = require('body-parser');
var stdin = process.openStdin();

/* 
	INIT LOG FILE 
*/
try {fs.mkdirSync('logs');} catch(err) {
	if( err.code != 'EEXIST' ) {
		console.log(err);
		process.exit();
	}
}
var LOGFILE = 'logs/log_' + dateFormat("dd_mm_yy_HH_MM_ss") + '.txt';


/* 
	CONSOLE INPUT 
*/
stdin.addListener("data", function(data) {
	var command = data.toString().trim();
	if( command == "sessions") {
		console.log(Session.sessions);
	}
});

/* 
	OVERALL FUNCTIONS 
*/
function debug(message, display) {
	var now = new Date();
	var date = dateFormat("dd.mm.yyyy HH:MM:ss");
	if( display ) console.log('[' + date + '] ' + message);
	try { fs.appendFileSync(LOGFILE, '[' + date + '] ' + message  + '\n'); } catch(err) {
		console.log(err);
	}
}

function exists(obj) {
	if( typeof obj !== 'undefined' ) return true;
	return false;
}

function objToString(obj) {
	this.seen = [];

	return JSON.stringify(obj, function(key, val) {
	   if (val != null && typeof val == "object") {
			if (seen.indexOf(val) >= 0) {
				return;
			}
			seen.push(val);
		}
		return val;
	});
}

/* 
	SETUP WEBSERVER 
*/
webserver.listen(config.webserver_port);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function(req, res, next) {
	debug('Requesting Path:\'' + req.originalUrl + "\' Method=" + req.method, false);
	next();
});
debug('Server listen on localhost:' + config.webserverport, true);

/* 
	SETUP WEBSOCKET
*/
io.use(function(socket, next) {
	if( Session.existSession(socket.request) ) next();
});
io.sockets.on('connection', function(socket) {
	debug("WebSocket connected", false);
	modules.forEach( function(item, index) {
		socket.emit('module-connect', { 'name': item.request.headers.name });
	});
});

/* 
	MODULE SERVICE
*/
var modules = [];
ioModules.use(function(socket, next) {
	if( 	exists(socket.request.headers.password) 
		&&	exists(socket.request.headers.name)
		&& 	socket.request.headers.password == config.module_password
	) next();
});
ioModules.sockets.on('connection', function(socket) {
	var name = socket.request.headers.name;
	debug('Module connected: '  + name, true);
	io.sockets.emit('module-connect', { 'name': name });
	modules.push(socket);
	
	socket.on('os-info', function(data) {
		var info = { 'name': name, 'free': data.free, 'total': data.total };
		io.sockets.emit('os-info', info);
	});
});

/* 
	INFO SERVICE
*/
setInterval(function() {
	ioModules.sockets.emit('os-info');
}, 1000);


/****************************************************************************************************************************************
	PATHS TO WEBSITE
*****************************************************************************************************************************************/
app.get('/', function(req, res) {
	
});