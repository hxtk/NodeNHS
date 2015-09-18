// Core
var http = require('http');

// Server
var express = require('express');
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
app.use(express.static(__dirname+'/public'));

var server = http.createServer(app);

// Set up Socket.IO
var io = require('socket.io').listen(server);

// Routes
require('./app/routes')(app,models,KEY);

// Socket.IO
require('./app/socket')(io,models,KEY);

// Execute
app.listen(8080);
