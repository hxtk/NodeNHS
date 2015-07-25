var jwt = require('jsonwebtoken');

module.exports = function(io,models,KEY){
    io.on('connection', function(socket){
        socket.on('msg',function(msg){
            jwt.verify(msg.token,KEY,function(err,decoded) {
                if(err || !decoded){
                    return socket.emit('toast', {
                        type:'Error',
                        message:"You don't have permission to do that!"
                    });
                }
                socket.broadcast.emit('msg', msg);
                new models.Chat({
                    sender: msg.sender,
                    message: msg.message
                }).save();
            });
        });

    });
};