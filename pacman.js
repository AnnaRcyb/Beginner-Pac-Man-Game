//board
let board;
const rowCount = 21;
const colCount = 19;
const tileSize = 32;
const boardWidth = colCount * tileSize;
const boardHeight = rowCount * tileSize;
let context;

//images
let blueGhostImage;
let greenGhostImage;
let yellowGhostImage;
let pinkGhostImage;
let pacmandownImage;
let pacmanupImage;
let pacmanleftImage;
let pacmanrightImage;
let wallImage;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    loadImages();
    loadmap();
    //console.log(walls.size);
    //console.log(foods.size);
    //console.log(ghosts.size);
    for (let ghost of ghosts.values()) {
        const newDirection = directions[Math.floor(Math.random() * 4)]; //0-3
        ghost.updatedirection(newDirection);
    }
    update();
    this.document.addEventListener("keyup", movepacman);
}

const tilemap = [
    "xxxxxxxxxxxxxxxxxxx",
    "x  x      x       x",
    "x  x      x  xxx xx",
    "x xx  x x x   x   x",
    "x x   x xxxx     xx",
    "x x x x   x   xx xx",
    "x   x    xx    x xx",
    "x   x  x     x x  x",
    "xxx x  x bpg x xx x",
    "x   x  x  y  x  x x",
    "x xxx  xx   xx    x",
    "x   x          xxxx",
    "x x x   xxxxx     x",
    "x x x x       xx  x",
    "x x x x   P    x  x",
    "x x   x xxxxxx x  x",
    "x x x     x    xxxx",
    "x     x   x  x    x",
    "x xxxxxxx x  xxxxxx",
    "x         x      xx",
    "xxxxxxxxxxxxxxxxxxx"
];

const walls = new Set();
const foods = new Set();
const ghosts = new Set();
let pacman;

const directions = ["U", "D", "L", "R"];
let score = 0;
let lives = 3;
let gameOver = false;

function loadImages() {
    wallImage = new Image();
    wallImage.src = "./wall.png";

    blueGhostImage = new Image();
    blueGhostImage.src = "./blueghost.png";
    greenGhostImage = new Image();
    greenGhostImage.src = "./greenghost.png";
    yellowGhostImage = new Image();
    yellowGhostImage.src = "./yellowghost.png";
    pinkGhostImage = new Image();
    pinkGhostImage.src = "./pinkghost.png";

    pacmandownImage = new Image();
    pacmandownImage.src = "./pacmandown.png";
    pacmanupImage = new Image();
    pacmanupImage.src = "./pacmanup.png";
    pacmanleftImage = new Image();
    pacmanleftImage.src = "./pacmanleft.png";
    pacmanrightImage = new Image();
    pacmanrightImage.src = "./pacmanright.png";

}

function loadmap(){
    walls.clear();
    foods.clear();
    ghosts.clear();

    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < colCount; c++) {
            const rowString = tilemap[r];
            const tileMapChar = rowString[c];

            const x = c * tileSize;
            const y = r * tileSize;

            if (tileMapChar == "x") {
                const wall = new block(wallImage, x, y, tileSize, tileSize);
                walls.add(wall);
            }
            else if (tileMapChar == "b") {
                const blueGhost = new block(blueGhostImage, x, y, tileSize, tileSize);
                ghosts.add(blueGhost);
            }
            else if (tileMapChar == "g") {
                const greenGhost = new block(greenGhostImage, x, y, tileSize, tileSize);
                ghosts.add(greenGhost);
            }
            else if (tileMapChar == "y") {
                const yellowGhost = new block(yellowGhostImage, x, y, tileSize, tileSize);
                ghosts.add(yellowGhost);
            }
            else if (tileMapChar == "p") {
                const pinkGhost = new block(pinkGhostImage, x, y, tileSize, tileSize);
                ghosts.add(pinkGhost);  
            }
            else if (tileMapChar == "P") {
                pacman = new block(pacmanrightImage, x, y, tileSize, tileSize);
            }
            else if (tileMapChar == " ") { //empty space = food
                const food = new block(null, x + 14, y + 14, 4, 4);   //center food in tile
                foods.add(food);
            }

        }
    }
}

function update() {
    if (gameOver) {
        return;
    }
    move();
    draw();
    setTimeout(update, 50);
    //setInterval (needs to be called once)(update 50 milliseconds), setTimeout (recursive)(update, 50), requestAnimationFrame
    //20 fps 1 -> 1000ms/20 = 50ms
}



function draw() {
    context.clearRect(0, 0, board.width, board.height);
    context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height);
    for (let ghost of ghosts.values()) {
        context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
    }
    for (let wall of walls.values()) {
        context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
    }
    context.fillStyle = "pink";
    for (let food of foods.values()) {
        context.fillRect(food.x, food.y, food.width, food.height);
    }

    //score
    context.fillStyle = "black";
    context.font="14px sans-serif";
    if (gameOver) {
        context.fillText("Game Over:" + String(score), tileSize/2, tileSize/2);
    }
    else {
        context.fillText("x" + String(lives) + " " + String(score), tileSize/2, tileSize/2);
    }
    

}

function move() {
    pacman.x += pacman.velocityX;
    pacman.y += pacman.velocityY;

    //check wall collissions    
    for (let wall of walls.values()) {
        if (collission(pacman, wall)) {
            pacman.x -= pacman.velocityX;
            pacman.y -= pacman.velocityY;
            break;
        }
    }

    for (let ghost of ghosts.values()) {
        if (collission(ghost, pacman)) {
            lives -= 1;
            if (lives <= 0) {
                gameOver = true;
                return;
            }
            resetPositions();

        }

        if (ghost.y == tileSize * 9 && ghost.direction != "U" && ghost.direction != "D") {
            ghost.updatedirection("U");
        }

        ghost.x += ghost.velocityX;
        ghost.y += ghost.velocityY;

        //check wall collissions    
        for (let wall of walls.values()) {
            if (collission(ghost, wall) || ghost.x <= 0 || ghost.x + ghost.width >= boardWidth) {
                ghost.x -= ghost.velocityX;
                ghost.y -= ghost.velocityY;
                const newDirection = directions[Math.floor(Math.random() * 4)]; //0-3
                ghost.updatedirection(newDirection);
                break;
            }
        }
    }

    //check food collissions
    let foodEaten = null;
    for (let food of foods.values()) {
        if (collission(pacman, food)) {
            foodEaten = food;
            score += 10;
            break;
        }
    }

    foods.delete(foodEaten);

    //next level
    if (foods.size == 0) {
        loadmap();
        resetPositions();
    }
}

function movepacman(e) {
    if (gameOver) {
        loadmap();
        resetPositions();
        lives = 3;
        score = 0;
        gameOver = false;
        update();
        return;
    }
    if (e.code == "ArrowUp" || e.code == "KeyW") {
        pacman.updatedirection("U");
    }
    else if (e.code == "ArrowDown" || e.code == "KeyS") {
        pacman.updatedirection("D");
    }
    else if (e.code == "ArrowLeft" || e.code == "KeyA") {
        pacman.updatedirection("L");
    }
    else if (e.code == "ArrowRight" || e.code == "KeyD") {
        pacman.updatedirection("R");
    }

    //update pacman image
    if (pacman.direction == "U") {
        pacman.image = pacmanupImage;
    }
    else if (pacman.direction == "D") {
        pacman.image = pacmandownImage;
    }
    else if (pacman.direction == "L") {
        pacman.image = pacmanleftImage;
    }
    else if (pacman.direction == "R") {
        pacman.image = pacmanrightImage;
    }
}

function collission(a,b) {
    return (a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y);
}

function resetPositions() {
    pacman.reset();
    pacman.velocityX = 0;
    pacman.velocityY = 0;

    for (let ghost of ghosts.values()) {
        ghost.reset();
        const newDirection = directions[Math.floor(Math.random() * 4)]; 
        ghost.updatedirection(newDirection);
    }
}


class block {
    constructor (image, x, y, width, height) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.startX = x;
        this.startY = y;

        this.direction = "R";
        this.velocityX = 0;
        this.velocityY = 0;  //both 0 = stationary
    }

    updatedirection(direction) {
        const prevdirection = this.direction;
        this.direction = direction;
        this.updatevelocity();
        this.x += this.velocityX;
        this.y += this.velocityY;

        for (let wall of walls.values()) {
            if (collission(this, wall)) {
                this.x -= this.velocityX;
                this.y -= this.velocityY;
                this.direction = prevdirection;
                this.updatevelocity();
                return;
            }
        }

    }

    updatevelocity() {
        if (this.direction == "U") {
            this.velocityX = 0;
            this.velocityY = -tileSize / 4;
        }
        else if (this.direction == "D") {
            this.velocityX = 0;
            this.velocityY = tileSize / 4;
        }
        else if (this.direction == "L") {
            this.velocityX = -tileSize / 4;
            this.velocityY = 0;
        }
        else if (this.direction == "R") {
            this.velocityX = tileSize / 4;
            this.velocityY = 0;
        }
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
    }
}