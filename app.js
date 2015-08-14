var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	mongoose = require('mongoose');
	users = {};
	
//console.log(__dirname);
app.use('/', express.static(__dirname + '/www'));

server.listen(process.env.PORT || 3000);

//connect database
mongoose.connect('mongodb://localhost/chat', function(err){
	if(err){
		console.log(err);
	}else{
		console.log('Connected to mongodb');
	}
});
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
		msg = msg.trim();
		if(msg.substr(0, 3) === '/w '){
			msg = msg.substr(3);
			var ind = msg.indexOf(':');
			var name = msg.substr(0, ind);
			if(ind !== msg.length - 1){
				msg = msg.substr(ind + 1);
				if(name in users){
					users[name].emit('whisper', socket.nickname, msg);
				}
			} 	
		}
		else{
			socket.broadcast.emit('newMsg', socket.nickname, msg, color);
		}
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
