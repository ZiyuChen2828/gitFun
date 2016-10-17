var express = require('express');
var path = require('path');

var routes = require('./fetch/server');

var app = express();

// view engine setup

//app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public

app.use('/fetch', routes);

app.listen('8000', function(){
    console.log('Magic happens on port 8000');
});