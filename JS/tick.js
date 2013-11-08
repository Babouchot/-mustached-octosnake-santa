/*
*   tick.js
*   All functions to evolve one time step
*/

/***************** VARIABLES **************/

// To rotate
var pi = Math.PI;
var radToDeg = 180/pi;

// Constants for lunarlander
var gLune = 1.6;        // Gravity of the Moon
var ve = 4500;          // Speed of fuel ejection
var Te = 0.04;          // Sample Rate in seconds

var M_VIDE = 6839;              // Mass of empty lunarlander in kg
var M_FUEL_INIT = 816.5;        // Mass of fuel in kg
var m = M_VIDE + M_FUEL_INIT;   // Mass of LunarLander in kg
var m_fuel_actual = M_FUEL_INIT;
var m_fuel_consumming = 0;      // Mass of fuel consumming

var X0 = Vector.create([45,1,51,-1]);   // Position and speed at beginning
var X = X0;             // Initialisation position and speed
var h = 0;              // Initialisation number of step
var eps = ve/m;         // Epsilon

var C = Vector.create([0,0,0,0]);   // Position and speed for "retour d'etat"

var crashTime;
var isCrashed;
var isTakingOff;

var accelerationX = 0;
var accelerationY = 0;

var out_of_fuel = false;

/***************** FUNCTIONS **************/

    
/**
*   Tick(e)
*   Function that is launched at each frame 
*   
*/
function tick(e) {
    
    
    if (cAppuyer)
        initGame();
    else if (oAppuyer)
        initBoucleOuverteTempsFini();
    else if (rAppuyer)
        initBoucleFermeeTempsFini();
    else if (isCrashed && upHeld) {
        
        updatePositionsGame();
        if (accelerationY > 5) {
            drawLunarlander(e.delta/1000, accelerationX, accelerationY);
            initGame();
            isCrashed = false;
        }

    } else if (isSimulation != 0) {  
        if (isSimulation == 1) {
            // Commands with keys
            updatePositionsGame(); 
            drawLunarlander(e.delta/1000, accelerationX, accelerationY);  
            
        } else if (isSimulation == 2) {
            
            cumul_delta += e.delta/1000;
            
            if (cumul_delta > cumul_te) {
                rapport = Math.round(cumul_te / Te) * 2;

                cumul_te += Te;
                
                accelerationX = contenu_file_commands[rapport] / 1;
                accelerationY = contenu_file_commands[rapport+1] / 1;
                
                
                if(rapport < contenu_file_commands.length) {
                    drawLunarlander(Te, accelerationX, accelerationY+gLune/eps);
                } else { 
                    // When the file is entirely readden.
                    crash();
                }
                
            }
        } else if (isSimulation == 3) {
                
            var Xn = kre.multiply(C.subtract(X));
            
            accelerationX = Xn.e(1);
            accelerationY = Xn.e(2);
            
            drawLunarlander(Te, accelerationX, accelerationY+gLune/eps);
                
        }
        
        // Text
        fpsLabel.text = Math.round(createjs.Ticker.getMeasuredFPS()) + " fps ";

    }

    updateLeftPanel();
    stage.update();
}


/**
* updatePositionsGame()
* Updates movings on X and Y
*/
function updatePositionsGame() {
    if(!out_of_fuel)
    {
        if(spaceAppuyer){
            stopThrust();
        }

        if(lfHeld) {
            accelerationX=decrementAcc(accelerationX);
            // start playing the "fly" sequence:
            lunarlander.gotoAndPlay("fly_left");
        }
        
        if(rtHeld) {
            accelerationX=incrementAcc(accelerationX);
            // start playing the "fly" sequence:
            lunarlander.gotoAndPlay("fly_right");
        }
        
        if(upHeld) {
            accelerationY=incrementAcc(accelerationY);
            // start playing the "fly" sequence:
            lunarlander.gotoAndPlay("fly_up");
        }
        
        if(dwHeld) {
            accelerationY=decrementAcc(accelerationY);
            // start playing the "fly" sequence:
            lunarlander.gotoAndPlay("fly_up");
         }
         
         if (!lfHeld && !rtHeld && !upHeld && !dwHeld) {
            // start playing the "fly" sequence:
            lunarlander.gotoAndPlay("fall");
         }
     }
}

function crash() {
    // Re-draw LunarLander on the moon
    lunarlander.y = stage.canvas.height - HEIGHT_LL/2;
    lunarlander.gotoAndPlay("fall");
    isCrashed = true;

    // Calculate time
    var date = new Date();
    var time = (date.getTime() - lastCrashTime) / 1000;
        
    crashTime = time;
    crashField.text = "Crash at " + crashTime;
    
    // Save the new time of flying and add the new time to the cumul
    lastTimeOfFlying = crashTime;
    cumulTime += lastTimeOfFlying;

    // To check if positions are not down 0.
    positionX = X.e(1);
    
    if (X.e(3) < 0) positionY = 0;
    else            positionY = X.e(3);
    
    // To erase speed and accleration
    X0 = Vector.create([positionX,0,positionY,0]);
    X = X0;
    accelerationX = 0;
    accelerationY = 0;
   
    isSimulation = 0;
    
    // To erase drawings of speed and acceleration
    drawSpeed();
    drawAcc();
}



/**
*   drawLunarlander(delta, accelerationX, accelerationY)
*   Function which calculates position and speed for one frame 
*   Return false if lunarlander is still flying, or true if not.
*/
function drawLunarlander(delta, accelerationX, accelerationY)
{
    
    eps = ve/m;         // Epsilon

    // Time since the last frame
    Te = delta;
    
    // Number of step
    h += 1;
    
    // Matrice A
    var ad = Matrix.create([
                [1,Te,0,0],
                [0,1,0,0],
                [0,0,1,Te],
                [0,0,0,1]
                ]);

    // Matrice B
    var bd = Matrix.create([
            [(eps*Te*Te)/2,0],
            [eps*Te,0],
            [0,(eps*Te*Te)/2],
            [0,eps*Te]
            ]);

    var mat = bd.multiply(Vector.create([accelerationX,accelerationY-gLune/eps]));

    X = ad.multiply(X);
    X = X.add(mat);

    // Update positions
    lunarlander.x = computeX(X.e(1)) + WIDTH_LL/2;
    lunarlander.y = computeY(X.e(3)) + HEIGHT_LL/2;

    drawSpeed();
    drawAcc();
    
    var newSpeed = Math.sqrt(Math.pow(X.e(2),2) + Math.pow(X.e(4),2))
    updateFuel(delta);

    // When LunarLander touch the floor
    if (lunarlander.y + HEIGHT_LL/2 >= stage.canvas.height) {  
        crash();
    }
}



/*
*   drawSpeed()
*   Draw the shape representing the speed  
*/
function drawSpeed()
{
    speed.graphics.clear();
    var calcul = Math.sqrt(Math.pow(X.e(2),2) + Math.pow(X.e(4),2));
    speed.x = lunarlander.x;
    speed.y = lunarlander.y;
    speed.rotation = 0;
    speed.graphics.beginFill("green").rect(0, -(calcul*pixMeter*0.25)/2, pixMeter*calcul*0.75, 0.25*pixMeter*calcul);
    speed.rotation = -radToDeg*Math.atan2(X.e(4), X.e(2));
}

/*
*   drawAcc()
*   Draw the shape representing the acceleration  
*/
function drawAcc()
{
    acc.graphics.clear();
    var calcul = Math.sqrt(Math.pow(accelerationX,2) + Math.pow(accelerationY,2));
    acc.x = lunarlander.x;
    acc.y = lunarlander.y;
    acc.rotation = 0;
    acc.graphics.beginFill("yellow").rect(0, -(calcul*pixMeter*0.125)/2, pixMeter*calcul*0.50, 0.125*pixMeter*calcul);
    acc.rotation = -radToDeg*Math.atan2(accelerationY, accelerationX);
}

/**
*   updateLeftPanel()
*   Update infos in left panel
*/
function updateLeftPanel() {
    
    //Position
    document.getElementById('positionX').innerHTML = roundSmall((lunarlander.x - WIDTH_LL/2)/7);
    document.getElementById('positionY').innerHTML = roundSmall(canvas.height/7 - (lunarlander.y + HEIGHT_LL/2)/7);
    
    // Speed
    document.getElementById('speedX').innerHTML = roundSmall(X.e(2));
    document.getElementById('speedY').innerHTML = roundSmall(X.e(4));
    
    // Acceleration
    document.getElementById('accelerationX').innerHTML = roundSmall(accelerationX);
    document.getElementById('accelerationY').innerHTML = roundSmall(accelerationY);
    
    // Time
    if (isCrashed) {
        document.getElementById('simulationTime').innerHTML = roundSmall(cumulTime);
        document.getElementById('lastCrashTime').innerHTML = roundSmall(lastTimeOfFlying);
    } else if (lastCrashTime == undefined) {
        document.getElementById('simulationTime').innerHTML = roundSmall(cumulTime);
        document.getElementById('lastCrashTime').innerHTML = roundSmall(0);
    } else {
        var date = new Date();
        var time = (date.getTime() - lastCrashTime) / 1000;
        document.getElementById('simulationTime').innerHTML = roundSmall(cumulTime + time);
        document.getElementById('lastCrashTime').innerHTML = roundSmall(time);
    }
    
    // Command
    switch (isSimulation) {
        case 0 : document.getElementById('command').innerHTML = "---"; break;
        case 1 : document.getElementById('command').innerHTML = "Manuel"; break;
        case 2 : document.getElementById('command').innerHTML = "Boucle ouverte & Temps Fini"; break;
    }
}

function updateFuel(delta){
    m_fuel_consumming = (Math.abs(accelerationX)+Math.abs(accelerationY))*delta;
    m_fuel_actual -= m_fuel_consumming;
    if(m_fuel_actual<0)
    {
        m_fuel_actual = 0;
        out_of_fuel = true;
        stopThrust();
    }
    var barre = document.getElementById("fuel");
    barre.value = (m_fuel_actual/M_FUEL_INIT)*100;
    document.getElementById('fuellabel').innerHTML = Math.round((m_fuel_actual/M_FUEL_INIT)*100);
}

function stopThrust(){
    accelerationY = 0;
    accelerationX = 0;
}