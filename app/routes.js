// Auth
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');

// Document Rendering
var marked = require('marked');
marked.setOptions({
    sanitize : true,
    smartypants : true

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
        if(!req.user){
            res.json({
                error: {
                    type: 'error',
                    body: 'You\'re not allowed to do that!'
                }
            });
            return;
        }
        if(req.param.id===undefined){
            res.json({name:"Error",title:"No ID found in request"});
        }
        if(!req.param.id.match(/^[0-9a-z]{24}$/i)){
            res.json({name:"Error",title:"Malformed ID"});
        }
        var id = mongoose.Types.ObjectId.createFromHexString(req.param.id);
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
        var nUser = new models.Users({
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password),
            name: req.body.name,
            year: req.body.year
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

 root


    // Auth Routes
    app.post('/auth/token', function(req, res){
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