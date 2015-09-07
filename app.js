// Core
var https = require('https');
var fs = require('fs');

// Server
var express = require('express');
var forceSSL = require('express-force-ssl');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var scribe = require('scribe-js')();

// MongoDB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nhs');
var models = require('./app/mongomodels');

// Set up globals
var console = process.console;
var app = express();
var KEY = 'a39ca1637e6cc89ebfb538b41f68a1b0';
var jwtCheck = expressJwt({secret:KEY,credentialsRequired: false});

// Set up server
app.use('/api', jwtCheck);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(forceSSL);
app.use(express.static(__dirname+'/public'));

// SSL
var options = {
	key: fs.readFileSync('./keys/node.key'),
	cert: fs.readFileSync('./keys/node.crt')
};
var server = https.createServer(options,app);

// Set up Socket.IO
var io = require('socket.io').listen(server);

// Routes
require('./app/routes')(app,models,KEY);

// Socket.IO
require('./app/socket')(io,models,KEY);

// Execute
app.listen(80);
server.listen(443);
