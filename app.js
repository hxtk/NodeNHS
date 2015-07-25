// Core
var https = require('https');
var fs = require('fs');

// Server
var express = require('express');
var forceSSL = require('express-force-ssl');
var bodyParser = require('body-parser');
var unless = require('express-unless');
var expressJwt = require('express-jwt');

// MongoDB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nhs');
var models = require('./app/mongomodels');

// Set up globals
var app = express();
var KEY = 'a39ca1637e6cc89ebfb538b41f68a1b0';
var jwtCheck = expressJwt({secret:KEY,credentialsRequired: false});
jwtCheck.unless = unless;

// Set up server
app.use('/api', jwtCheck.unless({path:'/api/auth'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(forceSSL);
app.use(express.static(__dirname+'/public'));

// SSL
var options = {
	key: fs.readFileSync('./keys/key.pem'),
	cert: fs.readFileSync('./keys/key-cert.pem')
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
