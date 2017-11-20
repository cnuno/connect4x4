var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var count = 0;
var idx = 0;
var ready = false;
var gamestarted = false;
var movesmade = [];
var movecount = 0;
var players = new Array();
for (var i = 0; i < 4; i++) {
	players[i] = new Array();
	for (var j = 0; j < 8; j++) {
		players[i][j] = -1;
	}
}

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');

});

io.on('connection', function (socket) {
	var socketId = socket.id;
 
	if (gamestarted == true) {
		var conn1 = false;
		for (var i = 0; i < 4; i++) {
			if (players[i][1] == false && conn1 == false) {
				players[i][0] = socket.id;
				players[i][1] = true;
				for (var j = 0; j < movecount; j++) {
					socket.emit('chat message', movesmade[j]);
				}
				
				for (var k = 0; k < movecount; k++) {
					var cmove = movesmade[k];
					var matches = 0;
					for (var l = k+1; l < movecount; l++) {
						var nmove = movesmade[l];
						if (cmove == nmove) {
							matches++;
						}
					}
					console.log(cmove + " matched " + matches + " times ");
				}
				console.log("player " + i + " reconnected with new id " + players[i][0]);
				conn1 = true;
			}
		}
	}
	if (gamestarted == false) {
		//console.log(socket.connected);
		players[count][0] = socketId;
		players[count][1] = true;
		console.log("player " + count + " connected");
		count += 1;
		if (count == 4) {
			gamestarted = true;
			ready = true;
		}
	}
	//console.log(ready);
	var client = [];
	//console.log(count);


	socket.on('chat message', function (msg) {
		console.log(socket.id + " compared to players " + players[idx][0]);
		if (players[idx][0] == socket.id && ready == true) {
			client[0] = socket.id;
			client[1] = msg;
			if (socket.id == players[0][0]) {
				client[1] += ' blue';
			} else if (socket.id == players[1][0]) {
				client[1] += ' red';
			} else if (socket.id == players[2][0]) {
				client[1] += ' green';
			} else {
				client[1] += ' yellow';
			}
			movesmade[movecount] = client[1];
			movecount++;
			//console.log(client[1]);
			io.emit('chat message', client[1]);

			
			idx++;
			makeMove();
			if (idx == 4) {
				idx = 0;
				makeMove();
			}

		}
	});


	socket.on('disconnect', function () {
		console.log("player " + socket.id + " disconnected");
		for (var i = 0; i < 4; i++) {
			if (players[i][0] == socket.id) {
				players[i][1] = false;
			}
		}
		console.log("check before conn");
		var conn = "";
		for (var check = 0; check < 4; check++) {
			if(players[check][1] == false) {
				conn = conn + "0 ";
			} else if(players[check][1] == true) {
				conn = conn + "1 ";
			}
		}
		console.log(conn);
		console.log("check after conn");
		io.emit('disconnect', conn);
		
		if (players[idx][0] == socket.id && players[idx][1] == false) {
			console.log("making move for disconnected player " + players[idx][0]);

			var inout = Math.floor(Math.random() * (1 - 0) + 0);
			var inouts;
			if (inout == 1)
				inouts = '#irow-';
			else
				inouts = '#row-';
			var row = Math.floor(Math.random() * (7 - 0) + 0);
			var col = Math.floor(Math.random() * (7 - 0) + 0);

			var str = inouts + row + '-col-' + col;
			if (idx == 0) {
				str += ' blue';
			} else if (idx == 1) {
				str += ' red';
			} else if (idx == 2) {
				str += ' green';
			} else {
				str += ' yellow';
			}
			io.emit('chat message', str);
			movesmade[movecount] = str;
			movecount++;
			//makeMove();
			idx++;
			makeMove();
			if (idx == 4) {
				idx = 0;
				makeMove();
			}
		}

		for (var i = 0; i < 4; i++) {
			if (players[i][0] == socket.id) {
				players[i][1] = false;
			}
		}

	});

	function makeMove() {
		// if(idx == 4) {
			// idx = -1;
		//}
		for (var i = 0; i < 4; i++) {
			if (players[i][1] == true) {

			}
			if (players[i][1] == false && i == idx) {
				console.log("making move for disconnected player " + players[i][0]);

				var inout = Math.floor(Math.random() * (10 - 0) + 0);
				var inouts;
				if (inout <= 5)
					inouts = '#irow-';
				else
					inouts = '#row-';
				var row = Math.floor(Math.random() * (7 - 0) + 0);
				var col = Math.floor(Math.random() * (7 - 0) + 0);

				var str = inouts + row + '-col-' + col;
				if (i == 0) {
					str += ' blue';
				} else if (i == 1) {
					str += ' red';
				} else if (i == 2) {
					str += ' green';
				} else {
					str += ' yellow';
				}
				io.emit('chat message', str);
				movesmade[movecount] = str;
				movecount++;
				idx++;
				if (idx == 4) {
					idx = 0;
					makeMove();
				}
			}
		}
	}

	//

});


http.listen(3000, function () {
	console.log('Using port *:3000');
});