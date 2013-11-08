/*
*   init.js
*   Functions to init the simulation
*/

/***************** VARIABLES **************/

var canvas;			//Main canvas
var stage;			//Main display stage

var isSimulation;   // 0 : none
                    // 1 : Game
                    // 2 : Boucle Ouverte Temps Fini
            
var imgLL;          // Image object
var lunarlander;    // Sprite object

var speed;          // Shape for speed of lunarlander
var acc;            // Shape for acceleration of lunarlander

// Dimensions of Lunarlander
var WIDTH_LL = 50;
var HEIGHT_LL = 58;

// Frames
var NUMBER_FRAMES = 50; // fps
var TIME_FRAME = 1.0/NUMBER_FRAMES;


// To get the cumul of time of the entire simulation (so the cumul of 'lastTimeOFlying')
var cumulTime;
// To get the last time of flying
var lastTimeOfFlying;

// To get the time of the last crash
var lastCrashTime;


// File for "Boucle ouverte Temps Fini"
var NAME_FILE_COMMANDS = "commands.txt";
var contenu_file_commands;

// File for "Boucle fermee Temps Fini"
var NAME_FILE_KRE = "Kre.txt";
var contenu_file_kre;
var kre;            // Matrice K

var cumul_delta;
var cumul_te;

/***************** FUNCTIONS **************/

/**
*   Init()
*   First function that is launched when the page is loaded.
*   Initialize the canvas in adding all used objects.
*/
function init() {
   
    canvas = document.getElementById('gameCanvas');
    stage = new createjs.Stage(canvas);

    //Create the background
    var rectangle = new createjs.Shape();
    rectangle.graphics.beginFill("black").rect(0, 0, 800, 600);
    //Add Shape instance to stage display list.
    stage.addChild(rectangle);
    
    // Position Text Display (Position)
    messageField = new createjs.Text("", "bold 18px Arial", "#FFFFFF");
    messageField.maxWidth = 1000;
    messageField.textAlign = "center";
    messageField.x = 200;
    messageField.y = canvas.height - 20;
    stage.addChild(messageField);
    
    
    // Position Text Display (Time before crash)
    crashField = new createjs.Text("", "bold 18px Arial", "#FFFFFF");
    crashField.maxWidth = 1000;
    crashField.x = 600;
    crashField.y = canvas.height - 20;
    stage.addChild(crashField);
    
    
    // Current FPS Display
    fpsLabel = new createjs.Text("-- fps ","bold 14px Arial","#FFF");
    fpsLabel.x = 10;
    fpsLabel.y = 20;
    stage.addChild(fpsLabel);
    createjs.Ticker.setFPS(25);
    
    // Image
    imgLL = new Image();
    imgLL.src = "img/sprite.png";
    imgLL.onload = initImage;

    isSimulation = 0;
    
    // Time 
    cumulTime = 0; 
        
    // Add Listener
    createjs.Ticker.addEventListener("tick", tick);
    stage.update();
}


function initImage(event) {
    
    // create spritesheet and assign the associated data.
    var spriteSheet = new createjs.SpriteSheet({
        // image to use
        images: [imgLL], 
        // width, height & registration point of each sprite
        frames: {width: 50, height: 58, regX: 25, regY: 29}, 
        animations: {    
            fly_up: [0, 3, "fly_up", 3],
            fall: [4, 4, "fall"],
            fly_right: [5, 8, "fly_right", 3],
            fly_left: [9, 12, "fly_left", 3]
        }
    });
    
    // create a BitmapAnimation instance to display and play back the sprite sheet:
    lunarlander = new createjs.BitmapAnimation(spriteSheet);

    // start playing the "fall" sequence:
    lunarlander.gotoAndPlay("fall");
        
    lunarlander.name = "lunarlander";
    lunarlander.x = computeX(45) + WIDTH_LL/2;
    lunarlander.y = computeY(51) + HEIGHT_LL/2;
            
    lunarlander.currentFrame = 0;
    stage.addChild(lunarlander);

    speed = new createjs.Shape();
    stage.addChild(speed);

    acc = new createjs.Shape();
    stage.addChild(acc);

}


/**
* initGame()
* Init the timer and launch the game
*
*/
function initGame() {

    // Time at beginning
    var date = new Date();
    lastCrashTime = date.getTime(); 
    isSimulation = 1;
}


/**
* initBoucleOuverteTempsFini()
* Init the timer and launch the simulation
*
*/
function initBoucleOuverteTempsFini() {
    // Time at beginning
    var date = new Date();
    lastCrashTime = date.getTime(); 
    
    // Lire fichier
    file = readFile(NAME_FILE_COMMANDS);
    contenu_file_commands = file.split(",");
        
    isSimulation = 2;
    cumul_te = 0;
    cumul_delta = 0;
}

/**
* initBoucleFermeeTempsFini()
* Init the timer and launch the simulation
*
*/
function initBoucleFermeeTempsFini() {
    // Time at beginning
    var date = new Date();
    lastCrashTime = date.getTime(); 
    
    // Lire fichier
    file = readFile(NAME_FILE_KRE);
    contenu_file_kre = file.split(",");
    
    var kM = contenu_file_kre;
    
    // Matrice K
    kre = Matrix.create([
                [kM[0]/1,kM[1]/1, kM[2]/1, kM[3]/1 ],
                [kM[4]/1,kM[5]/1, kM[6]/1, kM[7]/1 ]
                ]);

    isSimulation = 3;
    cumul_te = 0;
    cumul_delta = 0;
}