const CANVAS_W = 640;
const CANVAS_H = 480;
const TILE_W = 32;

const BOARD_W = CANVAS_W/TILE_W;
const BOARD_H = CANVAS_H/TILE_W;

const NONE = -1;
const UP = 0;
const RIGHT = 1;
const DOWN = 2;
const LEFT = 3;

// snake and food
//
let snake = new Array(1); // array of (x,y) coordinates representing the snake
let foodPosition = new Array(2);

// current direction
let direction = NONE;

// canvas and rendering context
let canvas = null;
let ctx = null;

// time variable (in seconds)
let elapsedSeconds = 0;
let score = 0;
let stopped = false;

// timer IDs
//
let updateIntervalId = -1;
let timerId = -1;

// clear the canvas
function clear() {
    ctx.fillStyle = 'darkgreen';
    ctx.fillRect(0,0,canvas.width,canvas.height);
}

// draw the board's current state
function drawBoard() {
    ctx.beginPath();
    clear();
    
    // draw food
    ctx.fillStyle = 'orange';
    ctx.fillRect(foodPosition[0]*TILE_W, foodPosition[1]*TILE_W, TILE_W, TILE_W);

    // draw snake
    ctx.fillStyle = 'darkred';
    let radius = TILE_W/2;

    for (let i = 0; i < snake.length; ++i) {
        ctx.beginPath();
        ctx.ellipse(snake[i][0]*TILE_W+radius, snake[i][1]*TILE_W+radius, radius, radius, 0, 0, 6.28);
        ctx.fill();
        ctx.fillStyle = 'white';
    }
}

function updateAndDraw() {
    // two separate if-statements because update() can
    // set stopped = true, and we don't want the board's
    // graphics to refresh if the game was stopped in
    // update().
    if (!stopped) update();
    if (!stopped) drawBoard();
}

// update the game state
function update() {
    let findSnakeCoord = function() {
        for (let i = 0; i < snake.length; ++i) {
            if (this[0] === snake[i][0] && this[1] === snake[i][1]) {
                return true;
            }
        }
        return false;
    };

    const delta = {
        [NONE]: [0,0],
        [UP]: [0,-1],
        [RIGHT]: [1,0],
        [DOWN]: [0,1],
        [LEFT]: [-1,0]
    };

    // move the snake
    let x = snake[0][0] + delta[direction][0];
    let y = snake[0][1] + delta[direction][1];

    // check if the snake is about to collide with itself
    if (direction !== NONE) {
        if (snake.find(findSnakeCoord, [x,y])) {
            alert("Oh no! - You ate your own tail!");
            endGame();
            return;
        }
    }

    // check if the snake is going off screen
    if (x >= BOARD_W || x < 0 || y >= BOARD_H || y < 0) {
        alert("Oops - you ran into the edge!");
        endGame();
        return;
    }

    // if the snake head is now colliding with the food,
    // move the food to a new position and add a node to the snake
    if (x === foodPosition[0] && y === foodPosition[1]) {
        foodPosition[0] = Math.floor(Math.random()*(BOARD_W-1));
        foodPosition[1] = Math.floor(Math.random()*(BOARD_H-1));
        ++score;
        document.getElementById("score").innerHTML = "Score: " + score;
    }
    else {
        // If we didn't consume a food, pop the tail off the snake
        // so it "moves." If we did consume a food, this won't be called,
        // so the snake will end up with an extra node when snake.unshift()
        // is called.
        snake.pop();
    }

    // add a snake node at the new position it moved to
    snake.unshift([x,y]);
}

function endGame() {
    stopped = true;
    document.getElementById("restartBtn").disabled = false;

    // overlay the canvas with gray
    ctx.fillStyle = 'rgba(0,0,0,0.333)';
    ctx.fillRect(0,0,CANVAS_W,CANVAS_H);

    // stop the update intervals
    clearInterval(updateIntervalId);
    clearInterval(timerId);
    
    updateIntervalId = -1;
    timerId = -1;
}

function updateTimer() {
    elapsedSeconds++;

    // update clock
    let m = Math.floor(elapsedSeconds / 60);
    let s = elapsedSeconds % 60;

    document.getElementById("time").innerHTML = "Time: "+m+"m "+s+"s";
}

window.addEventListener("load", function(){
    // initialize canvas
    canvas = document.getElementById("app");
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    ctx = canvas.getContext("2d");

    document.getElementById("restartBtn").addEventListener(
        "click", 
        function(){
            window.location.reload()
        }
    );

    // initialize snake and food
    snake[0] = [Math.floor(BOARD_W/2), Math.floor(BOARD_H/2)];
    
    foodPosition = [Math.floor(Math.random()*(BOARD_W-1)),
        Math.floor(Math.random()*(BOARD_H-1))];

    drawBoard();
});

// handle keyboard input
window.addEventListener("keydown", function(event){
    const dirs = {
        "ArrowUp": UP,
        "ArrowRight": RIGHT,
        "ArrowDown": DOWN,
        "ArrowLeft": LEFT
    };

    const opposites = {
        [UP]: DOWN,
        [RIGHT]: LEFT,
        [DOWN]: UP,
        [LEFT]: RIGHT
    };

    if (event.key in dirs) {
        // start game if it's stopped
        if (updateIntervalId === -1) {
            updateIntervalId = setInterval(updateAndDraw, 100);
            timerId = setInterval(updateTimer, 1000);
        }

        if (dirs[event.key] !== opposites[direction] || snake.length === 1){
            direction = dirs[event.key];
        }
    }
});