var express = require('express');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nhs');
var db = mongoose.connection;
var Schema = mongoose.Schema;

var app = express();

app.use(express.static(__dirname+'/public'));

app.get('/',function(req, res){
    res.render('main.jade',{
        id: 0
    });
});
app.get('/js/router.js',function(req,res){

});

app.listen(8080);
