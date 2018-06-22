var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

users = [];
connections = [];

console.log('Server running...');

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', (socket) => {
	connections.push(socket);
	console.log(`Connected: ${connections.length} sockets connected`);
	io.emit('initialize', connections.indexOf(socket)); // sending initializing index at the moment

	socket.on('send message', (data)=>{
		console.log(`Connection ${connections.indexOf(socket)}: ${data}`);
		io.emit('new message', {msg: data});
	});

	// Disconnect
	socket.on('disconnect', (data) => {
		connections.splice(connections.indexOf(socket), 1);
		console.log(`Disconnected: ${connections.length} sockets connected`);
	});
});
server.listen(process.env.PORT || 3000);
