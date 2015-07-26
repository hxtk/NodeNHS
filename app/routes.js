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

    //API Read Routes
    app.get('/api/read/news',function(req,res){
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

    app.get('/api/read/group',function(req,res){

    });

    app.get('/api/read/chat',function(req,res){
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

    app.get('/api/read/user',function(req,res){
        if(!req.query.id){
            res.json({name:"Error",title:"No ID found in request"});
        }
        if(!req.query.id.match(/^[0-9a-z]{24}$/i)){
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

    // API Write Routes
    app.post('/api/write/news',function(req,res){
        if(req.user.perms < 2){
            res.json({
                type:'error',
                title:'Unauthorized',
                msg:"You don't have permission to do that!"
            });
        }else{
            new models.News({
                title: req.body.title,
                auth: {
                    name: req.user.name,
                    id: req.user.id
                },
                body: marked(req.body.article)
            }).save();
        }
    });

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
                        group: user.group,
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