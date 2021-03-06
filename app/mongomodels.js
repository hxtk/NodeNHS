/**
 * Created by peter on 7/2/15.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ns = new Schema({
    title: String,
    auth: [{
        name: String,
        id: Schema.Types.ObjectId
    }],
    date: { type: Date, default: Date.now },
    body: String,
    createdAt: {type:Date,expires:94608000,default:Date.now()}
});

var gs = new Schema({
    title: String,
    date: {type:Date, default: Date.now},
    value: Number,
    desc: String,
    members: [Schema.Types.ObjectId],
    max: Number,
    createdAt: {type:Date,expires:94608000,default:Date.now()}
});

var us = new Schema({
    email: {type:String, required: true, unique: true},
    password: {type:String, required: true},
    name: {type:String, required: true},
    class: Number,
    hours: {
        group: {type:Number,default:0},
        other: {type:Number,default:0}
    },
    perms: {type: Number, default: 1},
    title: {type: String, default: "Member"},
    group: [Schema.Types.ObjectId],
    mailpub: {type:Boolean, default:true},
    token: {type: String, required: true},
    verified: {type:Boolean, default:false},
    createdAt: {type:Date,expires:94608000,default:Date.now()}
});

var cs = new Schema({
    sender: {id: Schema.Types.ObjectId, name: String},
    message: String,
    createdAt: {type: Date, expires: 86400, default: Date.now()}
});

module.exports.News = mongoose.model('News', ns);
module.exports.Group = mongoose.model('Group', gs);
module.exports.Users = mongoose.model('Users', us);
module.exports.Chat = mongoose.model('Chat', cs);
