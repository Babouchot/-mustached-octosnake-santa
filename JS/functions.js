/*
*   functions.js
*   All useful general functions
*/

/***************** VARIABLES **************/

var pixMeter = 7;
var max_Acceleration = 20;

/***************** FUNCTIONS **************/

/**
*   computeY(y)
*   Calculate the real position
*   
*/
function computeY(y){
    return y = 0.90332 * stage.canvas.height - y * pixMeter;
}

/**
*   computeX(x)
*   Calculate the real position
*   
*/
function computeX(x){
    return x = x * pixMeter;
} 

/**
*   roundSmall(number)
*   Reduce numbers of decimals
*   
*/
function roundSmall(number)
{
    return Math.round(number * 100)/100; 
}

/**
*   readFile(name)
*   Return the contain of the file
*/
function readFile(name) {
    // Lire fichier
    file = new XMLHttpRequest();
    file.open("GET", name, false);
    file.send(null);
    return file.responseText;
}

function incrementAcc(value)
{
    if(++value>max_Acceleration)
        value=max_Acceleration;
    return value;
}

function decrementAcc(value)
{
    if(--value<-max_Acceleration)
        value=-max_Acceleration;
    return value;
}