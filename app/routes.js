// Auth
var bcrypt = require('bcrypt-nodejs');
var uuid = require('uuid');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var fs = require('fs');

// Document Rendering
var marked = require('marked');
marked.setOptions({
    sanitize : true,
    smartypants : true

});

var transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: JSON.parse(fs.readFileSync("/var/www/cchs-nhs.com/keys/email.json"))
});

module.exports = function(app,models,KEY){

    app.get('/',function(req, res){
        res.render('main.jade');
    });


    // API Routes
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

    // News Routes
    app.get('/api/news',function(req,res){
        models.News.find({}).sort('-date').exec(function(err,news){
            if(err){
                var answer = [{
                    title: "Error",
                    body: "Database query failed"
                }];
                res.json(answer);
                console.log(err);
            }
            res.json(news);
        });
    });
    app.post('/api/news',function(req,res){
        if(!req.user){
            res.json({
                type:'error',
                title: 'Unauthorized',
                msg: 'You have to be logged in for that!'
            })
        }
        if(req.user.perms < 2){
            res.json({
                type:'error',
                title:'Unauthorized',
                msg:"You don't have permission to do that!"
            });
        }else{
            new models.News({
                title: req.body.title,
                auth: [{
                    name: req.user.name,
                    id: req.user.id
                }],
                body: marked(req.body.article)
            }).save(function(err){
                    if(err){
                        res.json({
                            type:"error",
                            title:"Database Error",
                            msg:"Saving to database failed; please try again later"
                        });
                    }
                });
        }
    });
    app.put('/api/news/:id',function(req,res){
        if(!req.user){
            res.json({
                type:'error',
                title: 'Unauthorized',
                msg: 'You have to be logged in for that!'
            });
            return;
        }
        if(req.user.perms < 2){
            res.json({
                type:'error',
                title:'Unauthorized',
                msg:"You don't have permission to do that!"
            });
            return;
        }

        var id = mongoose.Types.ObjectId.createFromHexString(req.param.id);
        models.News.findOne({_id:id}).exec(function(err,news){
            var idin = false;
            for(var i= 0,l=news.auth.length; i < l; i++){
                if(news.auth[i].id == req.user.id){ idin = true; break; }
            }
            if(!idin) news.auth[i].push({id:req.user.id,name:req.user.name});
            news.body = marked(req.body.article);
            news.save(function(err){
                if(err){
                    console.log(err);
                    res.json({
                        type:"error",
                        title:"Database Error",
                        msg:"Saving to database failed; please try again later"
                    });
                }
            });
        });
    });
    app.delete('/api/news/:id',function(req,res){
        if(!req.user){
            res.json({
                type:'error',
                title: 'Unauthorized',
                msg: 'You have to be logged in for that!'
            });
            return;
        }
        if(req.user.perms < 2){
            res.json({
                type:'error',
                title:'Unauthorized',
                msg:"You don't have permission to do that!"
            });
            return;
        }
        var id = mongoose.Types.ObjectId.createFromHexString(req.param.id);
        models.News.findOne({_id:id}).remove().exec(function(err,news){
            if(err){
                console.log(err);
                res.json({
                    type: 'error',
                    title: 'Database',
                    msg: 'Deleting failed!'
                });
            }
        });
    });

    // Group Projects Routes
    app.get('/api/group',function(req,res){
        res.statusCode(501);
        res.send("Not implemented");
    });

    // Chat Route
    app.get('/api/chat',function(req,res){

        models.Chat.find({}).sort('-createdAt').exec(function(err,msgs){
            if(err){
                var answer = [{
                    sender: {name:"Error"},
                    body: "Cache unavailable"
                }];
                res.json(answer);
                console.log(err);
            }
            res.json(msgs);
        });
    });

    // User Text Routes
    app.get('/api/user/:id',function(req,res){
        if(req.user===undefined){
            res.json({
                error: {
                    type: 'error',
                    body: 'You\'re not allowed to do that!'
                }
            });
            return;
        }
        if(req.params.id===undefined){
            res.json({name:"Error",title:"User not found"});
        }
        if(!req.params.id.match(/^[0-9a-z]{24}$/i)){
            res.json({name:"Error",title:"User not found"});
        }
        var id = mongoose.Types.ObjectId.createFromHexString(req.params.id);
        models.Users.findOne({"_id":id}).exec(function(e,u){
            if(e){
                res.json({name:"Error",title:"Database connection failed"});
                return console.log(e);
            }
            if(u===undefined || u===null){
                res.json({name:"Error",title:"User not found"});
                return console.log("User id: "+id+"\nUser not found");
            }
            var answer = {
                name: u.name,
                title: u.title,
                hours: u.hours,
                groups: u.group
            };
            if(u.mailpub)
                answer.email = u.email;
            res.json(answer);
        });
    });
    app.post('/api/user',function(req,res){
        if(req.body.email===undefined||req.body.password===undefined||req.body.name===undefined||!req.body.year===undefined){
            res.json({
                error:{
                    type: 'error',
                    msg: 'Please fill out all fields'
                }
            });
            return;
        }
        models.Users.findOne({email: req.body.email}).exec(function(err,user){
            console.log("Checking for other users at that email");
            console.log(err);
            console.log(user);
            if(err){ res.json({error:"Server unavailable; Please try again later or contact the webmster."}); return console.log(err); }
            if(user != undefined){
                console.log("User found");
                res.json({error:"User already exists. Did you forget your password?"}); return;
            }
        });

        var nUser = new models.Users({
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password),
            name: req.body.name,
            year: req.body.year,
            token: uuid.v4()
        });

        var maildata = {
            from: "CCHS National Honor Society",
            to: nUser.email,
            subject: "Please Verify Your Account",
            text: "Please click the following link to complete your registration.\n" +
                  "If the link is unavailable, copy and paste it into your address bar.\n" +
                  "https://cchs-nhs.com/#/login/"+nUser.token,
            html: "Please click the following link to complete your registration.\n" +
                  "If the link is unavailable, copy and paste it into your address bar.\n" +
                  '<a href="https://cchs-nhs.com/#/login/'+nUser.token+'">https://cchs-nhs.com/#/login/'+nUser.token+'</a>'
        };

        transporter.sendMail(maildata,function(err,info){
            if(err != undefined){
                console.log(err);
            }
            console.log("Message sent to " + maildata.to);
        });

        nUser.save(function(err) {
                if (err) {
                    console.log(err);
                    res.json({
                        error: {
                            type: 'error',
                            msg: 'something went wrong!'
                        }
                    });
                }
            var profile = {
                id: nUser._id,
                email: nUser.email,
                name: nUser.name,
                hours: nUser.hours,
                perms: nUser.perms,
                title: nUser.title
            };
            var token = jwt.sign(profile, KEY, {expiresInMinutes: 60 * 48});
            res.json({token: token});
        });
    });
    app.put('/api/user/:id',function(req,res){

    });
    app.get('/api/user/:id',function(req,res){
        if(!req.user){
            res.json({
                error: {
                    type: 'error',
                    title: 'Authentication Error',
                    body: 'You\'re not allowed to do that!'
                }
            });
            return;
        }
        res.setHeader('X-Content-Type-Options','nosniff');
    });


    // Auth Routes
    app.post('/auth/token', function(req, res){
        models.Users.findOne({email: req.body.email}).exec(function(err,user){
            if(err){ res.json({error:"Server unavailable"}); return console.log(err); }
            if(user===undefined || user === null){
                res.json({error:"User not found"}); return;
            }

            bcrypt.compare(req.body.password, user.password, function(e, r){
                if(e) return console.log(e);
                if(r) {

                    if(!user.verified){
                        if(req.body.token === undefined){
                            res.json({
                                info:"You haven't verified your account yet. Please check your email.<br>"+
                                "Can't find the email? Check your spam box.<br>"+
                                'Still missing? Click <a href="#/verify">here</a> to resend verification email.'
                            });
                            return;
                        }

                        if(req.body.token == user.token){
                            user.verified = true;
                            user.token = uuid.v4();
                            user.save();
                        }else{
                            console.log(req.body.token + "\n" + user.token + "\nNo match");
                            res.json({
                                info: 'That token has expired. Click <a href="#/verify">here</a> to resend verification email.'
                            });
                        }

                    }

                    var profile = {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        hours: user.hours,
                        perms: user.perms,
                        title: user.title
                    };
                    var token = jwt.sign(profile, KEY, {expiresInMinutes: 60 * 48});
                    res.json({token: token});
                }else{
                    res.json({error:"Incorrect password"});
                }
            });
        });
    });
};