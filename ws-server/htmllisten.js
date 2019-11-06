const WebSocketServer = require('websocket').server;
const http = require('http');
var request = require('request');
var fs = require('fs');
var path = require('path');

// 创建一个HTTP Server
let httpServer = http.createServer((request, response) => {
	console.log('['+(new Date())+']Received request for '+request.url);
	response.writeHead(404);
	response.end();
});


// 创建一个WebSocket Server
var wsServer = new WebSocketServer({
	httpServer:httpServer,
	autoAcceptConnections:true
});


// 事件监听
wsServer.on('connect',(connection) => {
	
	connection.on('message', (message) => {
		if (message.type === 'utf8') {
			
			/*
			request('http://gps.cn126.net/igetpos.asp?uid=15772&pwd=244213&dev=0&datatype=json', function (error, response, body) {
				if (!error && response.statusCode == 200) {
					var match = body.match("{");
					if (match != null)
					{
						console.log(body) // Show the HTML for the baidu homepage.
						var obj = JSON.parse(body);
						var x = obj.lng;
						var y = obj.lat; 
						connection.sendUTF(x+","+y);
					}
				}
			})
			*/
			
			fs.readFile(path.dirname(__filename)+'/message.txt', function (err, data) {
				if (err) {
					console.error(err);
				}
				console.log('send data to web:'+data.toString())
				connection.sendUTF(data.toString());
			});
		}
	});
	
	connection.on('close', (reasonCode, description) => {
		console.log('['+(new Date())+'] Peer '+connection.remoteAddress+' disconnected.');
	});
	
})

// 启动HTTP Server
httpServer.listen(8080,() => {
	console.log('['+(new Date())+'] Server is listening on port 8080');
});
