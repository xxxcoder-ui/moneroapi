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


var io = require('socket.io').listen(server);


var reward;
var BlockHeight;
var BlockDiff;
var coded;
var xmr;

   function convert(n){
       var [lead,decimal,pow] = n.toString().split(/e|\./);
       return +pow <= 0
       ? "0." + "0".repeat(Math.abs(pow)-1) + lead + decimal
       : lead + ( +pow >= decimal.length ? (decimal + "0".repeat(+pow-decimal.length)) : (decimal.slice(0,+pow)+"."+decimal.slice(+pow)))
    }
	
function GetStatus(){		
getJSON('https://moneroblocks.info/api/get_stats', function(error, response){
 
    //console.log(error);
    // undefined
    BlockHeight = response.height;
	BlockDiff = response.difficulty;
	reward = (response.last_reward / 1000000000000).toFixed(3);
	xmr = convert((1000000 / BlockDiff) * reward * 0.9);
    console.log(response);

});
}

GetStatus();

setInterval(function () {
	GetStatus();
}, 30000);

io.sockets.on('connection', function (socket) {

   socket.emit('message', { BlockHeight: BlockHeight, reward: reward, xmrReward: xmr, ServerMessage: '<div class="alert alert-danger" role="alert">This is a danger alert—check it out!</div>' });

});


io.sockets.on('connection', (socket) => {
    setInterval(() => {
        //socket.emit('message', coded)
		socket.emit('message', { BlockHeight: BlockHeight, reward: reward, xmrReward: xmr, ServerMessage: '<div class="alert alert-success" role="alert">This is a success alert—check it out!</div>' });
    }, 5 * 1000);
});


server.listen(8888);
