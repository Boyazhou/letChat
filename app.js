var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	users = {};
	
//console.log(__dirname);
app.use('/', express.static(__dirname + '/www'));

server.listen(process.env.PORT || 3000);

io.sockets.on('connection', function(socket){
	
	
	socket.on('login', function(data){
		if(data in users){ //nickname exists
			socket.emit('nickExsited');
		}
		else{
			socket.userIndex = Object.keys(users).length;
			socket.nickname = data;
			users[socket.nickname] = socket;
			socket.emit('loginSuccess');
			updateNicknames();
			io.sockets.emit('system', data, Object.keys(users).length, 'login');
		}	
	});
	
	function updateNicknames(){
		io.sockets.emit('usernames', Object.keys(users));
	}
	/**
	socket.on('send message', function(data){
			console.log("data");
			io.sockets.emit('new message', {msg: data, nick: socket.nickname});
			//socket.broadcase.emit('new message', data);
	});
	*/
	socket.on('postMsg', function(msg, color){
		socket.broadcast.emit('newMsg', socket.nickname, msg, color);
	});
	
	socket.on('img', function(imgData, color){
		socket.broadcast.emit('newImg', socket.nickname, imgData, color);
	});
	
	socket.on('disconnect', function(data){
		if(!socket.nickname)
			return;
		delete users[socket.nickname];
		updateNicknames();
		socket.broadcast.emit('system', socket.nickname, Object.keys(users).length, 'logout');
	});
	
	
	
});
