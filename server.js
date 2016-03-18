var config = require('./server/config.js');

global.dev = config.dev;

/////////////////
// Start website
/////////////////
var express = require('express');
var compression = require('compression');
var expressLayouts = require('express-ejs-layouts');
var fs = require('fs');
var bunyan = require('bunyan');
var http = require('http');

var logger = bunyan.createLogger({
	name: 'portfolio',
	streams: [
		{
			level: 'info',
			path: 'logs/log.txt'
		},
		{
			level: 'warn',
			path: 'logs/log.txt'
		},
		{
			level: 'error',
			path: 'logs/log.txt'
		}
	]
});

var app = express();
app.use(compression());

/////////////////
// Functions
/////////////////
Array.prototype.filterObjects = function(key, value) {
	return this.filter(function(x) { return x[key] === value; })
}

app.locals.year = function() {
	return new Date().getUTCFullYear();
}

/////////////////
// Templating
/////////////////
app.set('view engine', 'ejs');

app.use(expressLayouts)

var wordnik = require('./server/wordnik.js');

var routing = require('./server/routing.js');
routing(app, fs, express, config, logger, wordnik, http);

/////////////////
// Inititialise
/////////////////

if(config.type == 'node') {
	// Used for Node server.
	var server = app.listen(config.port, config.ip, function () {
		var host = server.address().address;
		var port = server.address().port;

		logger.info('Website listening at http://%s:%s.', host, port);
	});
} else if(config.type == 'iis') {
	// Used for IISNode.
	app.listen(process.env.PORT);
} else {
	logger.error('Error: wrong config.type set');
}

