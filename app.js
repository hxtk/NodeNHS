var https = require('https');
var fs = require('fs');

var express = require('express');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nhs');
var models = require('./app/mongomodels');
var db = mongoose.connection;
var Schema = mongoose.Schema;

var app = express();

var KEY = 'a39ca1637e6cc89ebfb538b41f68a1b0';

//app.use('/api', expressJwt({secret: KEY}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(__dirname+'/public'));

app.get('/',function(req, res){
    res.render('main.jade',{
        id: 0
    });
});

app.get('/api/news',function(req,res){
	models.News.find({}).exec(function(err,news){
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

app.get('/api/search',function(req,res){
	var re = new RegExp(req.query.q, 'i');

	models.Users.find().or([{ 'name': { $regex: re }}, { 'title': { $regex: re }}]).sort('name.first').exec(function(err, users) {
		var answer = {users:new Array(),groups:new Array};
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

app.post('/api/token', function(req, res){
    models.Users.findOne({email: req.body.email},'id email password name hours perms group',function(err, user){
	if(err){ res.send("User not found"); console.err(err); }
	bcrypt.compare(req.body.password, user.password, function(e, r){
	    var profile = {
		id: user._id,
		email: email,
		name: user.name,
		hours: user.hours,
		perms: user.perms,
		group: group
	    };
	    jwt.sign(profile, KEY, {expiresInMinutes: 60*48});
	});
    });
			 
    
});

var options = {
    key: fs.readFileSync('./keys/key.pem'),
    cert: fs.readFileSync('./keys/key-cert.pem')
};

app.listen(8080);
https.createServer(options,app).listen(443);
