/**
 * Created by peter on 7/2/15.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = mongoose.connection;

var ns = new Schema({
    title: String,
    auth: [{
        name: String,
        id: Schema.Types.ObjectId
    }],
    date: { type: Date, default: Date.now },
    body: String
});

var gs = new Schema({
    title: String,
    date: {type:Date, default: Date.now},
    value: Number,
    desc: String,
    members: [Schema.Types.ObjectId],
    max: Number
});

var us = new Schema({
    email: String,
    password: String,
    name: String,
    hours: {
        group: Number,
        other: Number
    },
    perms: {type: Number, default: 1},
    title: String,
    group: [Schema.Types.ObjectId]
});

module.exports.News = mongoose.model('News', ns);
module.exports.Group = mongoose.model('Group', gs);
module.exports.Users = mongoose.model('Users', us);
