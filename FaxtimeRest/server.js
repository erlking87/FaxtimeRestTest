'use strict';

var port = process.env.PORT || 8000; // first change
//var port = 1443;
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var swaggerize = require('swaggerize-express');
var swaggerUi = require('swaggerize-ui'); // second change
var path = require('path');

var app = express();

var server = http.createServer(app);

app.use(bodyParser.json());

app.use(swaggerize({
    api: path.resolve('./config/swagger.json'), // third change
    handlers: path.resolve('./handlers'),
    docspath: '/swagger' // fourth change
}));

// change four
app.use('/docs', swaggerUi({
    docs: '/swagger'
}));

server.listen(port, function () { // fifth and final change
    console.log("start server");
});

app.get('/', (req, res) => {
    console.log("/start");
    res.send('Hello World!\n');
});

app.post('/v1/sender/sms', (req, res) => {
    var userId = req.body.userId;
    var password = req.body.password;

    console.log("userId : " + userId);
    console.log("password : " + password);
});

/*
var http = require('http');
var port = process.env.port || 1337;
http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
}).listen(port);
*/
