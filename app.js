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
app.use('/admin/logs',jwtCheck, function(req,res,next){
	if(req.user) {
		if (req.user.perms >= 4) next();
		else {
			console.tag("Malicious")
				.time()
				.error("[%s] %s (id: %s) requested logs! Unauthorized!",req.ip,req.user.name, req.user.id);
			res.json({
				type:'error',
				title:'Unauthorized',
				msg:"You don't have permission to do that!"
			});
		}
	} else {
		console.tag("Malicious")
			.time()
			.error("[%s]: Unauthenticated request for logs", req.ip);
		res.json({
			type:'error',
			title:'Unauthorized',
			msg:"You don't have permission to do that!"
		});
	}
},scribe.webPanel());

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
