var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs');
    getJSON = require('get-json');
	
var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"};


// Loading the index file . html displayed to the client

var server = http.createServer(function(req, res){

    if(req.url === "/"){
        fs.readFile("./index.html", "UTF-8", function(err, html){
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(html);
        });
    }else if(req.url.match("\.js$")){
        var jsPath = path.join(__dirname, '/', req.url);
        var fileStream = fs.createReadStream(jsPath, "UTF-8");
        res.writeHead(200, {"Content-Type": "application/javascript"});
        fileStream.pipe(res);

    }else if(req.url.match("\.css$")){
        var cssPath = path.join(__dirname, '/', req.url);
        var fileStream = fs.createReadStream(cssPath, "UTF-8");
        res.writeHead(200, {"Content-Type": "text/css"});
        fileStream.pipe(res);

    }else if(req.url.match("\.png$")){
        var imagePath = path.join(__dirname, '/', req.url);
        var fileStream = fs.createReadStream(imagePath);
        res.writeHead(200, {"Content-Type": "image/png"});
        fileStream.pipe(res);
    }else{
        res.writeHead(404, {"Content-Type": "text/html"});
        res.end("No Page Found");
    }

});


var io = require('socket.io').listen(server);


var reward;
var BlockHeight;
var BlockDiff;
var coded;
var xmr;
var dt;
var utcDate;

   function convert(n){
       var [lead,decimal,pow] = n.toString().split(/e|\./);
       return +pow <= 0
       ? "0." + "0".repeat(Math.abs(pow)-1) + lead + decimal
       : lead + ( +pow >= decimal.length ? (decimal + "0".repeat(+pow-decimal.length)) : (decimal.slice(0,+pow)+"."+decimal.slice(+pow)))
    }
	
function GetStatus(){		
getJSON('https://moneroblocks.info/api/get_stats', function(error, response){
 
    dt = new Date();
    utcDate = dt.toUTCString();
    BlockHeight = response.height;
	BlockDiff = response.difficulty;
	reward = (response.last_reward / 1000000000000).toFixed(3);
	xmr = convert((1000000 / BlockDiff) * reward * 0.94);
    console.log(response);

});
}

GetStatus();

setInterval(function () {
	GetStatus();
}, 30000);

io.sockets.on('connection', function (socket) {

   socket.emit('message', { BlockHeight: BlockHeight, reward: reward, xmrReward: xmr, ServerMessage: utcDate });

});


io.sockets.on('connection', (socket) => {
    setInterval(() => {
        //socket.emit('message', coded)
		socket.emit('message', { BlockHeight: BlockHeight, reward: reward, xmrReward: xmr, ServerMessage: utcDate });
    }, 5 * 1000);
});


server.listen(8888);
