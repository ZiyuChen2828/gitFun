var events = require('events'),
    ws = require('ws'),
    http = require('http'),
    EventEmitter = events.EventEmitter,
    emitter = new EventEmitter(),
    
    express = require('express'),
    app = express();

emitter.on('update', function(){
    console.log('updating');
})

emitter.on('bee.debug', function(){
    console.log('debugging');
})

console.log(ws);
console.log('***************');
var WebSocketServer = ws.Server,
    server = http.createServer();
    webSocketServer = new WebSocketServer({
        server : server
    });

console.log(server);
console.log('server:****************');
console.log(webSocketServer);
console.log('webSocketServer:******************');

webSocketServer.on('connection', function connection(ws){
    console.log('connecting!!!!');
//    ws.on('message', function incoming(message) {
//        console.log('received: %s', message);
//    });
})
webSocketServer.emit('connection');
console.log(app);




