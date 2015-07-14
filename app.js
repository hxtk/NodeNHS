// Core
var https = require('https');
var fs = require('fs');

// Server
var express = require('express');
var forceSSL = require('express-force-ssl');
var bodyParser = require('body-parser');
var unless = require('express-unless');

// Auth
var bcrypt = require('bcrypt-nodejs');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var validator = require('validator');

// MongoDB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nhs');
var models = require('./app/mongomodels');
var db = mongoose.connection;
var Schema = mongoose.Schema;

// Set up globals
var app = express();
var KEY = 'a39ca1637e6cc89ebfb538b41f68a1b0';
var jwtCheck = expressJwt({secret:KEY});
jwtCheck.unless = unless;

// Set up server
app.use('/api', jwtCheck.unless({path:'/api/token'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(forceSSL);
app.use(express.static(__dirname+'/public'));

// Routes
app.get('/',function(req, res){
	res.render('main.jade');
});


// API Routes
app.get('/api/news',function(req,res){
	models.News.find({}).sort('-date').exec(function(err,news){
		if(err){
			var answer = [{
				title: "Error",
				body: "Database query failed"
			}];
			res.json(answer);
			console.err(err);
		}
		res.json(news);
	});
});

app.get('/api/group',function(req,res){

});

app.get('/api/user',function(req,res){
	if(!req.query.id){
		res.json({name:"Error",title:"No ID found in request"});
	}
	if(!req.query.id.match(/^[0-9a-z]+$/i)){
		res.json({name:"Error",title:"Malformed ID"});
	}
	var id = mongoose.Types.ObjectId.createFromHexString(req.query.id);
	models.Users.findOne({"_id":id}).exec(function(e,u){
		if(e){
			res.json({name:"Error",title:"Database connection failed"});
			return console.log(e);
		}
		if(!u){
			res.json({name:"Error",title:"User not found"});
			return console.log("User id: "+id+"\nUser not found");
		}
		var answer = {
			name: u.name,
			title: u.title,
			descr: u.descr,
			hours: u.hours,
			groups: u.group
		};
		if(u.mailpub){
			answer.mail = {addr: "mailto:"+u.email, text: "Send Message"};
		}else{ answer.mail = {addr:"javascript:;}", text:"Private"}; }
		res.json(answer);
	});
});

app.get('/api/search',function(req,res){
	var re = new RegExp(req.query.q, 'i');

	models.Users.find().or([{ 'name': { $regex: re }}, { 'title': { $regex: re }}]).sort('name.first').exec(function(err, users) {
		var answer = {users:[],groups:[]};
		for(var i = 0; i < users.length; i++){
			var tmp = {
				id: users[i]._id,
				name: users[i].name,
				title: users[i].title
			};
			answer.users.push(tmp);
		}
		res.json(answer);
	});
});

// Auth Routes
app.post('/api/token', function(req, res){
	console.log("Username: %s\nPassword: %s",req.body.email,req.body.password);
    models.Users.findOne({email: req.body.email}).exec(function(err,user){
		if(err){ res.json({error:"Database Call failed"}); return console.log(err); }
		if(!user){
			res.json({error:"User not found"}); return;
		}
		bcrypt.compare(req.body.password, user.password, function(e, r){
			if(e) return console.log(e);
			if(r) {
				var profile = {
					id: user._id,
					email: user.email,
					name: user.name,
					hours: user.hours,
					perms: user.perms,
					group: user.group
				};
				var token = jwt.sign(profile, KEY, {expiresInMinutes: 60 * 48});
				res.send(token);
			}else{
				res.json({error:"Incorrect password"});
			}
		});
    });
			 
    
});


// SSL
var options = {
    key: fs.readFileSync('./keys/key.pem'),
    cert: fs.readFileSync('./keys/key-cert.pem')
};

// Execute
app.listen(80);
https.createServer(options,app).listen(443);
