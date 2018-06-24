var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

players = [];
connections = [];

function Player(id, x, y, color) {
	this.id = id;
	this.x = x;
	this.y = y;
	this.color = color;
}

console.log('Server running...');

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', (socket) => {
	var player = new Player(socket.id, 0, 0, '#ff0000');
	players.push(player);
	console.log(`New player connected. ID: ${player.id}`);

	console.log(`Connected: ${players.length} sockets connected`);
	socket.emit('initialize', players); // Send list of all players to populate new client session 
	socket.broadcast.emit('new player', player); // Send new player data to all existing clients 

	socket.on('send message', (data)=>{
		console.log(`Connection ${players.indexOf(socket)}: ${data}`);
		io.emit('new message', {msg: data});
	});
	
	socket.on('input', (control)=>{
		console.log(`id:${player.id}, x:${player.x}, y:${player.y}`);
		let speed = 5;
		if(control.left) player.x = player.x - speed;
		if(control.right) player.x = player.x + speed;
		if(control.up) player.y = player.y - speed;
		if(control.down) player.y = player.y + speed;
	});

	// Disconnect
	socket.on('disconnect', (data) => {
		players.splice(players.indexOf(player), 1);
		console.log(`Disconnected: ${players.length} sockets connected`);
		io.emit('disconnect', player.id);
	});
});

setInterval(()=>{
	console.log('tick');
	io.emit('update', players);
}, 100);
server.listen(process.env.PORT || 3000);
