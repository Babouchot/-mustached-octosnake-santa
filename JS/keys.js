/*
*   keys.js
*   All events on keys
*/

/***************** VARIABLES **************/

// To move lunarlander
var KEYCODE_UP = 38;		
var KEYCODE_DOWN = 40;		
var KEYCODE_LEFT = 37;		
var KEYCODE_RIGHT = 39;	
var KEYCODE_SPACE = 32;
	
// Game
var KEYCODE_C = 67;

// Retour d'état en temps fini
var KEYCODE_O = 79;


var lfHeld;			
var rtHeld;			
var upHeld;			
var dwHeld; 
var cAppuyer;	
var oAppuyer;
var spaceAppuyer;

/***************** FUNCTIONS **************/

//register key functions
document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;


/**
*   handleKeyDown(e)
*   Updates keys (if they are down)
*   
*/
function handleKeyDown(e) {
    //cross browser issues exist
    if(!e){ var e = window.event; }
    switch(e.keyCode) {
        case KEYCODE_LEFT:	lfHeld = true; break;
        case KEYCODE_RIGHT: rtHeld = true; break;
        case KEYCODE_UP:	upHeld = true; break;
        case KEYCODE_DOWN:	dwHeld = true; break;
		case KEYCODE_C:	    cAppuyer = true; break;
		case KEYCODE_O:	    oAppuyer = true; break;
        case KEYCODE_SPACE: spaceAppuyer = true; break; 
    }
}

/**
*   handleKeyUp(e)
*   Updates keys (if they are up)
*   
*/
function handleKeyUp(e) {
    //cross browser issues exist
    if(!e){ var e = window.event; }
    switch(e.keyCode) {
        case KEYCODE_LEFT:	lfHeld = false; break;
        case KEYCODE_RIGHT: rtHeld = false; break;
        case KEYCODE_UP:	upHeld = false; break;
        case KEYCODE_DOWN:	dwHeld = false; break;
		case KEYCODE_C:	    cAppuyer = false; break;
		case KEYCODE_O:	    oAppuyer = false; break;
        case KEYCODE_SPACE: spaceAppuyer = false; break;
    }
}