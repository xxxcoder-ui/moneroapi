var http = require('http');

var fs = require('fs');

var getJSON = require('get-json');


// Loading the index file . html displayed to the client

var server = http.createServer(function(req, res) {

    fs.readFile('./index.html', 'utf-8', function(error, content) {

        res.writeHead(200, {"Content-Type": "text/html"});

        res.end(content);

    });

});


// Loading socket.io

var io = require('socket.io').listen(server);


// When a client connects, we note it in the console

io.sockets.on('connection', function (socket) {

    console.log('A client is connected!');

});

var reward;
var BlockHeight;
var coded;

function GetStatus(){		
getJSON('https://moneroblocks.info/api/get_stats', function(error, response){
 
    //console.log(error);
    // undefined
    BlockHeight = response.height;
	reward = (response.last_reward / 1000000000000).toFixed(3);
    console.log(response);

});
}

GetStatus();

setInterval(function () {
	GetStatus();
}, 30000);

io.sockets.on('connection', function (socket) {

   socket.emit('message', { BlockHeight: BlockHeight, reward: reward });

});


io.sockets.on('connection', (socket) => {
    setInterval(() => {
        //socket.emit('message', coded)
		socket.emit('message', { BlockHeight: BlockHeight, reward: reward });
    }, 5 * 1000);
});


server.listen(8080);