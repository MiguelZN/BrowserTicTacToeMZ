
// button1 = document.getElementById('button1');

// button1.addEventListener('click',function(){
// 	console.log(firebase.database());
// })

var hold_game = document.getElementById("holdgame"); //div that will hold the tictactoe game


//TICTACTOE GAME
var rows= 3;
var columns = 3;

var box_width = 1/rows;
var box_height = 1/columns;


for(var r =0;r<rows;r++){
	for(var c=0;c<columns;c++){
		let box = createElement('div');
		box.id = 'box'+r+c;
		console.log(box.id);
	}
}



//box.onclick = function(){}
//box.innerHTML = "hello";
//box.style.cssText = "position:absolute;top:300px";