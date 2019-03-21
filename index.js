var express = require('express');
var app = express();
var socket = require('socket.io');

var server = app.listen(3000, function(req,res){
	console.log('server online');
});



//Game Variables
var num_rows = 3;
var num_columns = 3;
var board = createBoard(num_rows, num_columns);
var game_turn = decideTurn(); //who's turn it is within the game
var players = {}; //the dictionary of players
var player_count = 0; //player counter to determine who is on team player1, team player2
console.log(game_turn);

//Score Variables
var player1_score = 0;
var player2_score = 0;
var ties = 0;

function createBoard(num_rows, num_columns){
	var board = [];

	for(var r =0;r<num_rows;r++){
		var row = [];
		for(var c=0;c<num_columns;c++){
			var column = "_";

			row.push(column);

		}

		board.push(row);
	}

	console.log(board);
	console.log(board[0][0]);

	return board;
}

function setPiece(board, player, row, column){
	if(player.player_turn=="X"){
		board[row][column] = "X";
	}
	else if(player.player_turn == "O"){
		board[row][column] = "O";
	}
}


function assignPlayer(socket, player_count){
	let socket_id = socket.id;
	console.log(socket_id in players);

	if(socket_id in players == false){
		console.log("SOCKET ID NOT FOUND IN PLAYERS");
		let player_piece = player_count%2;
		let id = socket.id;
		console.log(id);
		console.log(player_piece);
		console.log(Object.keys(players));

		if(player_piece==0){
			player_piece = "X";
		}
		else{
			player_piece = "O";
		}

		console.log("ASSIGNED PLAYER");

		let new_player = {
			id: id,
			piece: player_piece //either "X" or "Y"
		};

		players[id] = new_player;

		io.to(socket_id).emit('game_info', 
		{
			player:new_player,
			num_rows: num_rows,
			num_columns: num_columns,
			game_turn : game_turn
		});
	}
	else{
		console.log("SOCKET ID WAS ALREADY IN PLAYERS");

		let existing_player = players[socket_id];
		io.to(socket_id).emit('game_info',{
			player: existing_player,
			num_rows:num_rows,
			num_columns: num_columns,
			game_turn: game_turn
		});
	}
}

function switchTurn(gameturn){
	console.log("SWITCHED TURN");
	if(gameturn == "X"){
		gameturn = "O";
	}
	else{
		gameturn = "X";
	}

	return gameturn;
}

function decideTurn(){
	var choice = Math.floor(Math.random()*2)+1;
	var turn;

	console.log("DECIDED TURN");

	switch(choice){
		case 1:
		turn = "X";
		break;

		case 2:
		turn = "O";
		break;

		default:
		console.log("DID NOT WORK");
		break;
	}

	console.log(turn);
	return turn;
}


//Static Files
app.use(express.static('public'));

app.get('/',function(req,res){
	res.sendFile(__dirname+'/public/tictactoepage.html');
	console.log('working server');
})


//Socket Setup
var io = socket(server);

setInterval(function(){
	//Checks/Updates the game every 100ms 
	updateGame(board)
	checkIfWinner(board,num_rows,num_columns);

}, 100);

//checks the inputted board for if there is a winner or no winner
function checkIfWinner(board, num_rows, num_columns){
	isWinner = false; //no winner

	amount_required = num_columns;//the number of symbol occuring in row/column/diagonal to win
	amount_X_row = 0;
	amount_X_column = 0;
	amount_X_diagonal = 0;

	amount_O_row = 0;
	amount_O_column = 0;
	amount_O_diagonal = 0;


	//Checks Rows and Columns
	for(var r = 0;r<num_rows;r++){
		for(var c = 0;c<num_columns;c++){
			//Checks the rows 
			if(board[r][c]=="X"){
				amount_X_row+=1;
			}

			if(board[r][c]=="O"){
				amount_O_row+=1;
			}

			//Checks Columns
			if(board[c][r]=="X"){
				amount_X_column+=1;
			}

			if(board[c][r]=="O"){
				amount_O_column+=1;
			}
		}

		//ROWS:
		//if the amount of X's found did not meet the amount required to win then reset
		if(amount_X_row<amount_required){
			amount_X_row = 0;
		}
		else if(amount_X_row>=amount_required){
			isWinner = "X"; //says the winner is X
		}
		//if the amount of O's found did not meet the amount required to win then reset
		if(amount_O_row<amount_required){
			amount_O_row = 0;
		}
		else if(amount_O_row>=amount_required){
			isWinner = "O";
		}

		//COLUMNS:
		if(amount_X_column<amount_required){
			amount_X_column = 0;
		}
		else if(amount_X_column>=amount_required){
			isWinner = "X"; //says the winner is X
		}
		//if the amount of O's found did not meet the amount required to win then reset
		if(amount_O_column<amount_required){
			amount_O_column = 0;
		}
		else if(amount_O_column>=amount_required){
			isWinner = "O";
		}
	}

	//LEFT TO RIGHT BOTTOM DIAGONALLY
	for(var c=0;c<num_columns;c++){
		var r = c; //starting at the 0 row

		console.log("r:"+r);
		console.log("c:"+c);
		if(board[r][c]=="X"){
			amount_X_diagonal+=1;
		}

		if(board[r][c]=="O"){
			amount_O_diagonal+=1;
		}
	}

	//Checks X diagonally left to bottom
	if(amount_X_diagonal < amount_required){
		amount_X_diagonal = 0;
	}
	else if(amount_X_diagonal>=amount_required){
		isWinner = "X";
	}

	//Checks O diagonally left to bottom
	if(amount_O_diagonal < amount_required){
		amount_O_diagonal = 0;
	}
	else if(amount_O_diagonal>=amount_required){
		isWinner = "O";
	}

	console.log("X DIAG:"+amount_X_diagonal);
	console.log("O DIAG:"+amount_O_diagonal);

	//RIGHT TO LEFT BOTTOM DIAGONALLY
	var r = 0; //temporary row to start at top left and increment 1 each time to get to bottom right
	for(var c=num_columns-1;c>=0;c--){
		if(board[r][c]=="X"){
			amount_X_diagonal+=1;
		}

		if(board[r][c]=="O"){
			amount_O_diagonal+=1;
		}

		r+=1;
	}
	r=0;

	//Checks X diagonally left to bottom
	if(amount_X_diagonal < amount_required){
		amount_X_diagonal = 0;
	}
	else if(amount_X_diagonal>=amount_required){
		isWinner = "X";
	}


	//Checks O diagonally left to bottom
	if(amount_O_diagonal < amount_required){
		amount_O_diagonal = 0;
	}
	else if(amount_O_diagonal>=amount_required){
		isWinner = "O";
	}


	//Checks if there actually is a winner. 
	//If there is a winner, then server notifies the clients connected of which team
	//has won and refreshes the board
	if(isWinner!=false){
		//Sends to clients who was the winner
		io.emit('winner', {
			winner:isWinner
		});
		resetBoard();

		return;
	}

	//Checks if the board is full and there are no more empty spots
	var empty_spots_left = num_rows*num_columns;
	for(var r=0;r<num_rows;r++){
		for(var c=0;c<num_columns;c++){
			if(board[r][c]=="X" || board[r][c]=="O"){
				empty_spots_left-=1;
			}
		}
	}

	if(empty_spots_left==0){
		resetBoard();
		io.emit('no_winner');
		return;
	}
}

function resetBoard(){
	board = createBoard(num_rows, num_columns);
}

function updateGame(board){
	// console.log("updating clients' games");
	// console.log(board);

	io.emit('update_game', {
		board: board,
		game_turn: game_turn,
	});

	console.log(players);
	console.log(Object.keys(players).length);
}

io.on('connection',function(socket){
	player_count++;
	console.log('User '+socket.id+' has logged on.');
	let socket_id = socket.id;
	let current_player = players[socket_id]; //pulls out the client who is connecting 's player'

	let keys = Object.keys(players);
	console.log(socket_id);
	console.log(players);
	console.log(players[keys[0]]);
	console.log(current_player);

	//sending to client the player when they connect
	assignPlayer(socket,player_count);



	socket.on('button_pressed', function(data){
		console.log("USER:"+socket.id+ " PRESSED BUTTON AT ROW:"+data.row+", COLUMN:"+data.column);
		console.log(players);

		console.log(data);
		let socket_id = socket.id;
		let piece = players[socket_id].piece; //retrieves the player piece 

		console.log("OLD PLAYER PIECE:"+piece);
		board[data.row][data.column] = piece;
		console.log("OLDTURN:"+game_turn);
		game_turn = switchTurn(game_turn); //switches game turn EX: current_turn == 'X' to current_turn == "o"
		console.log("NEWTURN:"+game_turn);

		console.log("NEW PLAYER PIECE:"+players[socket_id].piece);
	})

	socket.on('disconnect',function(){
		console.log('User '+socket.id+' has logged off.');
		let socket_id = socket.id;

		delete players[socket_id]; //removes the player from the dictionary of players
	})


});