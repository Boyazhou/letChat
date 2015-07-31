window.onload = function(){
	var letschat = new Letschat();
	letschat.init();
}

var Letschat = function(){
	this.socket = null;
}

Letschat.prototype = {
	init: function(){
		var that = this;
		//connect socket and server;
		this.socket = io.connect();
		this.socket.on('connect', function(){
			document.getElementById('info').innerHTML = 'get yourself a nickname :)';
            document.getElementById('setNick').style.display = 'block';
            document.getElementById('nickname').focus();
			document.getElementById("loginBtn").addEventListener('click', function(){
				var nickName = document.getElementById('nickname').value;
				if(nickName.trim().length != 0){
					//not empty
					that.socket.emit('login', nickName);
				} 
				else{
					document.getElementById('nickname').focus();
				}
			}, false);
			//send message button add event listener
			document.getElementById('sendBtn').addEventListener('click', function(){
				var message = document.getElementById('message'),
					msg = message.value;
					color = document.getElementById('colorStyle').value;
				message.value = '';
				message.focus();
				if(msg.trim().length != 0){
					that.socket.emit('postMsg', msg, color);
					that._displayNewMsg('me', msg, color);
				}
			}, false);
			//send image button add event listener
			document.getElementById('sendImage').addEventListener('change', function(){
				//check if file is selected
				if(this.files.length != 0){
					//get the file
					var file = this.files[0];
						reader = new FileReader();
						color = document.getElementById('colorStyle').value;
					 if (!reader) {
						 that._displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red');
						 this.value = '';
						 return;
					 }; 
					 reader.onload = function(e) {
						 this.value = '';
						 that.socket.emit('img', e.target.result, color);
						 that._displayImage('me', e.target.result, color);
					 }
					 reader.readAsDataURL(file);
				}
			}, false);
			
			//enter button
			document.getElementById('nickname').addEventListener('keyup', function(e) {
				  if (e.keyCode == 13) {
					  var nickName = document.getElementById('nickname').value;
					  if (nickName.trim().length != 0) {
						  that.socket.emit('login', nickName);
					  };
				  };
			  }, false);
			  
			document.getElementById('message').addEventListener('keyup', function(e) {
				  var messageInput = document.getElementById('message'),
					  msg = messageInput.value,
					  color = document.getElementById('colorStyle').value;
				  if (e.keyCode == 13 && msg.trim().length != 0) {
					  messageInput.value = '';
					  that.socket.emit('postMsg', msg, color);
					  that._displayNewMsg('me', msg, color);
				  };
			  }, false);
		});
		//nickname is taken
		this.socket.on('nickExisted', function() {
		document.getElementById('info').textContent = '!nickname is taken, choose another pls'; 
		});
		
		this.socket.on('loginSuccess', function(){
			document.title = 'Letschat | ' + document.getElementById('nickname').value;
			document.getElementById('nickWrap').style.display = 'none';
			document.getElementById('message').focus();
		});
		//update usernames
		this.socket.on('usernames', function(data){
				var html = '';
				for(i=0; i < data.length; i++){
					html += data[i] + '<br/>'
				}
				console.log(html);
				document.getElementById('users').innerHTML = html;
		});
		
		this.socket.on('system', function(nickName, userCount, type){
			var msg = nickName + (type == 'login' ? ' joined' : ' left');
			that._displayNewMsg('system', msg, 'red');
			document.getElementById('status').textContent = userCount +  (userCount > 1 ? ' users' : ' user') + ' online';
		});
		
		this.socket.on('newMsg', function(user, msg, color){
			that._displayNewMsg(user, msg, color);
		});
		
		this.socket.on('newImg', function(user, img, color){
			that._displayImage(user, img, color);
		});
		//emoji
		this._initialEmoji();
		document.getElementById('emoji').addEventListener('click', function(e){
			var emojiwrapper = document.getElementById('emojiWrapper');
			emojiWrapper.style.display = 'block';
			e.stopPropagation();
		}, false);
		document.body.addEventListener('click', function(e){
			var emojiwrapper = document.getElementById('emojiWrapper');
			if(e.target != emojiwrapper)
				emojiwrapper.style.display = 'none';
		});
		document.getElementById('emojiWrapper').addEventListener('click', function(e){
			var target = e.target;
			if(target.nodeName.toLowerCase() == 'img')
				var messageInput = document.getElementById('message');
				messageInput.focus();
				messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
		}, false);
	},
	
	_displayNewMsg: function(user, msg, color){
		var container = document.getElementById('chat');
			msgToDisplay = document.createElement('p');
			date = new Date().toTimeString().substr(0, 8);
			//translate emoji
			msg = this._showEmoji(msg);
		msgToDisplay.style.color = color || '#000';
		msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
		container.appendChild(msgToDisplay);
		container.scrollTop = container.scrollHeight;
	},
	
	_displayImage: function(user, imgData, color){
		var container = document.getElementById('chat'),
			msgToDisplay = document.createElement('p');
			date = new Date().toTimeString().substr(0, 8);
		msgToDisplay.style.color = color || '#000';
		msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
		container.appendChild(msgToDisplay);
		container.scrollTop = container.scrollHeight;
	},
	
	//initialize emoji
	_initialEmoji: function() {
		var emojiContainer = document.getElementById('emojiWrapper'),
			docFragment = document.createDocumentFragment();
		for(var i = 69; i > 0; i--){
			var emojiItem = document.createElement('img');
			emojiItem.src = '../content/emoji/' + i + '.gif';
			emojiItem.title = i;
			docFragment.appendChild(emojiItem);
		};
		emojiContainer.appendChild(docFragment);
	},
	
	//translate emoji 
	_showEmoji: function(msg){
		var match, result = msg,
			reg = /\[emoji:\d+\]/g,
			emojiIndex,
			totalEmojiNum = document.getElementById('emojiWrapper').children.length;
		while(match = reg.exec(msg)){
			emojiIndex = match[0].slice(7, -1);
			if(emojiIndex > totalEmojiNum){
				result = result.replace(match[0], '[X]');
			}
			else{
				result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');
			}
		}
		return result;
	}
};

/*
		jQuery(function($){
			var socket = io.connect();
			var $nickForm = $("#setNick");
			var $nickError = $("#nickError");
			var $nickBox = $("#nickname");
			var $users = $("#users");
			var $messageForm = $('#send-message');
			var $messageBox = $('#message');
			var $chat = $('#chat');
			
			$nickForm.submit(function(e){
				e.preventDefault();
				socket.emit('new user', $nickBox.val(), function(data){
					if(data){
						$('#nickWrap').hide();
						$('#contentWrap').show();
					}
					else{
						$nickError.html('That username is already taken! Try again!');
					}
				});
				$nickBox.val('');
			});
			
			
			
			$messageForm.submit(function(e){
				e.preventDefault();
				socket.emit('send message', $messageBox.val());
				$messageBox.val('');
			});
			
			socket.on('new message', function(data){
				$chat.append('<b>' + data.nick + ': </b>' + data.msg + "<br/>");
			});
		});
*/
	