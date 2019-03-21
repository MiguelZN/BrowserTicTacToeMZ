var SOCKET_ID;
var socket = io.connect('http://localhost:3000');

var hold_game = document.getElementById("holdgame"); //div that will hold the tictactoe game
var current_turn_label = document.getElementById('current_turn_label'); //pulls game_state label
var team_label = document.getElementById('team_label');

//TICTACTOE GAME
var num_rows;
var num_columns;
var box_width;
var box_height;
var client_player;

//Updated variables
var board;
var game_turn;

socket.on('connect',function(){
	console.log("CONNECTED");
	SOCKET_ID = socket.io.engine.id; //gives the variable 'SOCKET_ID' to the client, the socket 
									//connection unique id (to idenify client-speciifc player)

	updateBackgroundColor(1500);
});

socket.on('game_info',function(data){
	console.log("GAME INFO");
	client_player = data.player; //sets 'client_player' variable to the client's player from the server
	// console.log("CLIENT_PLAYER:"+client_player);
	console.log("CLIENT PLAYER BELOW:");
	console.log(client_player);

	num_rows = data.num_rows;
	num_columns = data.num_columns;
	box_width = Math.floor((1/num_rows)*100)-1.5;
	box_height = Math.floor((1/num_columns)*100)-2;

	game_turn = data.game_turn;

	//MAIN:----------------------------
	createBoard(num_rows,num_columns);


	updateTeamLabel();
});

socket.on('update_game',function(data){
	board = data.board;
	game_turn = data.game_turn;
	redrawBoard(data.board,num_rows,num_columns);
	updateCurrentTurnLabel();
})

socket.on('winner',function(data){
	let winner = data.winner;
	alert("Team "+winner+" has won! New game proceeding...");
})

socket.on('no_winner',function(){
	alert("No winner! New game proceeding...");
})


function updateBackgroundColor(interval_speed){
	setInterval(function(){
		console.log(client_player);
		setElementRandomColor(document.documentElement);
		interval_speed = Math.floor(Math.random()*500);
	},interval_speed);
}


function clickedButton(id, row, column){
	let element = document.getElementById(id);
	console.log(element);
	let color = element.style.backgroundColor;
	let color_darken_amount = 50;

	let rgbstr = color.substring(0,3); //only pulls substring [beg,end) 
	let color1 = color.substring(4,7);
	let color2 = color.substring(8,12);
	let color3 = color.substring(13,17);

	let pressedcolor = rgbstr+"("+(parseInt(color1)-color_darken_amount)+","+(parseInt(color2)-color_darken_amount)+","+(parseInt(color3)-color_darken_amount)+")";
	element.style.backgroundColor = pressedcolor;

	console.log("PRESSEDCOLOR:"+pressedcolor);
	console.log("ROW:"+row + ", COLUMN:"+column);

	setTimeout(function(){
		element.style.backgroundColor = color;
	},50);

	// console.log(client_player.piece);
	// console.log(game_piece);
	// console.log(this.board);


	//Detects which button the user pressed and tells the server that the User has pressed the button at
	//row: 'row', column: 'column'
	let selected_piece = board[row][column];
	console.log(selected_piece);

	console.log("CURRENT TURN:"+ game_turn);
	console.log("PLAYER's PIECE:"+client_player.piece);
	console.log("SOCKET_ID:"+client_player.id);
	if(game_turn == client_player.piece){

	//if the piece does not equal to player's piece (TEAM PIECE)
	if(selected_piece != "X" && selected_piece != "O"){
		//Notifies the server that the user pressed the button located on row: 'rownumber' column: 'columnnumber'
		console.log("PRESSED BUTTON");
		socket.emit('button_pressed',{
			row: row,
			column: column
		})
	}
	//
	else if(selected_piece==client_player.piece){
		console.log("SELECTED THE SAME TILE PICK AGAIN");
		alert("You have selected the same piece tile! Pick again.");
	}
	else if(selected_piece != client_player.piece){
		alert("Another team's piece is already there! Pick again.");
	}
}
}

//Updates the player's team to what their piece is: either "TEAM X" or "TEAM O"
function updateTeamLabel(){
	team_label.innerHTML = "TEAM:"+client_player.piece;
}

function updateCurrentTurnLabel(){
	current_turn_label.innerHTML = "Current Turn:"+game_turn;
}

function createBoard(num_rows, num_columns){
	for(let r =0;r<num_rows;r++){
		for(let c=0;c<num_columns;c++){
			let box = document.createElement('div');
			let id = 'box'+"r"+r+"c"+c;
			box.id = id;
			console.log(box.id);
			let css = "background-color:rgb(150,150,150);width:"+box_width+"%;"+"height:"+box_width+"%;"+"display:inline-block;"+"border:solid;"+"margin-left:1px;";
			console.log(css);
			box.style.cssText = css;
			hold_game.appendChild(box);
			box.onclick = function(){clickedButton(id, r, c)};


			//Adding font 
			box.className = "CENTER";
			let paragraph = document.createElement('p');
			paragraph.className = "CENTER SQUARE";
			let text = document.createTextNode("_");
			paragraph.id = 'p'+"r"+r+"c"+c;

			//Adding paragraph into each tictactoe box
			paragraph.appendChild(text);
			box.appendChild(paragraph);

			//
		}}
}

function redrawBoard(board,num_rows, num_columns){
	for(let r =0;r<num_rows;r++){
		for(let c=0;c<num_columns;c++){
			let current_text = document.getElementById('p'+"r"+r+"c"+c); //pulls each html box and allows to edit it
			current_text.innerHTML = board[r][c]; //updates the text of each box's paragraph's text node
			// console.log(board);
			// console.log(current_text);
	}}
}

function setElementRandomColor(element){
	let color1 = Math.floor(Math.random()*255);
	let color2 = Math.floor(Math.random()*255);
	let color3 = Math.floor(Math.random()*255);

	element.style.backgroundColor = "rgb("+color1+","+color2+","+color3+")";
}







