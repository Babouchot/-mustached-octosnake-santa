// On va utiliser le module express qui permet de faire un serveur 
// web plus complet, capable de servir une page par defaut,
// des pages qui contiennent des css, qui incluent des fichiers 
// javascript etc



var express = require('express');
var app = express();
var socket = require('socket.io');
var server = app.listen(8080);
var io = socket.listen(server, { log: false });
var Sylvester = require('sylvester');


app.configure(function(){  
  app.use(express.static(__dirname + '/'));
});  

app.get('/', function(req, res, next){  
  res.render('index.html');  
});

console.log('Server running ou port 8080');


io.sockets.on('connection', gamerConnection);

var nbPlayer = 0;

var gameState = new Object();
gameState.direction = [];
gameState.score = [0,0];

var players = [];

function gamerConnection(socket){ 

	if (nbPlayer < 2) {
		console.log("Joueur"+(nbPlayer+1)+" s'est connecte");
		
		players[nbPlayer] = socket;
		socket.emit('registerEvent', nbPlayer++);

		if (nbPlayer > 1) {
			players[0].emit("newPlayerEvent");
		}

		socket.on('disconnect', function(){  
			io.sockets.emit('receiveMessage', nbPlayer, " s'est deconnecte");
			console.log("Left: player " + nbPlayer); 
			nbPlayer = nbPlayer - 1;
		});
		
		// Fonction qui renvoie un message à tout les clients,
		// en appelant la fonction receiveMessage définie dans
		// les clients  
		
		socket.on('directionChanged', function (playerInfo) {
			gameState.direction[playerInfo.number] = playerInfo.direction;
			if(playerInfo.number == 0 && nbPlayer > 1)
				players[1].emit("directionChangedEvent", gameState.direction[playerInfo.number]);
			else
				players[0].emit("directionChangedEvent", gameState.direction[playerInfo.number]);
			// console.log("new direction "+playerInfo.direction);
		});
	}
	
}


var mainLoop = function () {

	setTimeout (function() {
		mainLoop();
	}, 32);

};



mainLoop();