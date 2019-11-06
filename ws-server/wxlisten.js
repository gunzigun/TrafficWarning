const WebSocketServer = require('websocket').server;
const http = require('http');
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
			console.log('car position: '+message.utf8Data);
			
			fs.writeFile(path.dirname(__filename)+'/message.txt', message.utf8Data,  function(err) {
				if (err)	
				{
					console.error(err);
				}
			});
			//connection.sendUTF('[from server] '+message.utf8Data);
		}
	});
	
	connection.on('close', (reasonCode, description) => {
		console.log('['+(new Date())+'] Peer '+connection.remoteAddress+' disconnected.');
	});
	
})

// 启动HTTP Server
httpServer.listen(9000,() => {
	console.log('['+(new Date())+'] Server is listening on port 9000');
});
