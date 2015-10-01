var jwt = require('jsonwebtoken');
var marked = require('marked');

marked.setOptions({
    sanitize : true,
    smartypants : true,
    tables : false,
    breaks : false
});

module.exports = function(io,models,KEY){
    io.on('connection', function(socket){
        socket.on('msg',function(msg){
            jwt.verify(msg.token,KEY,function(err,decoded) {
                if(err || decoded===undefined){
                    console.log("Chat Error: Bad Token");
                    return socket.emit('toast', {
                        type:'error',
                        msg:"You don't have permission to do that!<br>Your message will not be broadcast!"
                    });
                }
                msg.message = marked(msg.message);
                socket.broadcast.emit('msg', msg);
                new models.Chat({
                    sender: msg.sender,
                    message: msg.message
                }).save(function(err){
                    if(err != null){
                        console.log(err);
                        return socket.emit('toast', {
                            type:'info',
                            msg:'database error<br>your message was not saved',
                            createdAt: Date.now() // This is necessary because of a race condition in the database
                        });
                    }
                });
            });
        });

    });
};