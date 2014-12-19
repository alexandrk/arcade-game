var Constants = new function(){
    this.canvasWidth = 505;
    this.canvasHeight = 536;
    this.startButtonX = this.canvasWidth / 2 - 125;
    this.startButtonY = this.canvasHeight / 2 - 25;
    this.startButtonWidth = 250;
    this.startButtonHeight = 50;
    this.infoBarHeight = 83;
};

var boardCoords = new function(){
    this.minX = -80;
    this.minY = -80;
    this.maxX = 450;
    this.maxY = 400;
    this.squareSize = {x: 101, y: 171};
    this.hitZone = {width: 70, height: 70};
    this.streets = [15, 100, 185];
    this.playerDefaults = {
        startX: Constants.canvasWidth / 2 - this.squareSize.x / 2,
        startY: Constants.canvasHeight - this.squareSize.y - 10,
        moveX: 100,
        moveY: 83
    };
};

// Enemies our player must avoid
var Enemy = function(x, y) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.x = x;
    this.y = y;
    this.speed = this.getSpeed();
    this.number = this.getNumber();
}

Enemy.prototype.getNumber = function(){
    var i = 1;
    return function(){return i++};
}();

// Generates random speed for the enemies
Enemy.prototype.getSpeed = function(){
    var speeds = [50, 75, 100, 125, 150, 175, 200, 225, 250];
    var randomArrayIndex = Math.floor(Math.random() * speeds.length);
    return speeds[randomArrayIndex];
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;

    // return bug to a random street line
    if (this.x > boardCoords.maxX + 100){
        this.x = boardCoords.minX;
        this.y = boardCoords.streets[Math.floor(Math.random() * boardCoords.streets.length)];
        this.speed = this.getSpeed();
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(character){

    this.sprite = character;
    this.life = 3;
    this.reset();
};

Player.prototype.reset = function(resetLife)
{
    // default value for the reset life parameter (true)
    resetLife = (resetLife == 'undefined') ? true : resetLife;

    this.x = boardCoords.playerDefaults.startX;
    this.y = boardCoords.playerDefaults.startY;

    this.life = (resetLife) ? 3 : this.life;
};

Player.prototype.update = function(dt)
{
    if (window.status == Menu.gameState.newGame ||
        window.status == Menu.gameState.reset ||
        window.status == Menu.gameState.restart
    ){

        //reset player coordinates, and life
        var resetLife = window.status == Menu.gameState.newGame;
        this.reset(resetLife);

        //changing game state to 'in progress'
        window.status = Menu.gameState.inProgress;
    }

    // Collision Detection
    // Note: Dependent on player instance and allEnemies array
    for (var i = 0; i < allEnemies.length; i++)
    {
        var enemy = allEnemies[i];
        if (player.x < enemy.x + boardCoords.hitZone.width &&
           player.x + boardCoords.hitZone.width > enemy.x &&
           player.y < enemy.y + boardCoords.hitZone.height &&
           player.y + boardCoords.hitZone.height > enemy.y)
        {
            window.status = Menu.gameState.collision;
            player.life -= 1;
            break;
        }
    }

    // Successfully passed the bugs (considered a WIN)
    if (this.y <= boardCoords.streets[0]){
        window.status = Menu.gameState.levelCompleted;
    }
    // Game Over, no life left
    else if (this.life <= 0){
        window.status = Menu.gameState.gameOver;
    }
};

Player.prototype.drawLife = function(life)
{
    ctx.save();
    ctx.fillStyle = "#ff0000";
    ctx.scale(.5, .5);

    for (var i = 0; i < life; i++) {
        ctx.beginPath();
        ctx.moveTo(75, 40);
        ctx.bezierCurveTo(75, 37, 70, 25, 50, 25);
        ctx.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5);
        ctx.bezierCurveTo(20, 80, 40, 102, 75, 120);
        ctx.bezierCurveTo(110, 102, 130, 80, 130, 62.5);
        ctx.bezierCurveTo(130, 62.5, 130, 25, 100, 25);
        ctx.bezierCurveTo(85, 25, 75, 37, 75, 40);
        ctx.fill();

        ctx.translate(120, 0);
    }
    ctx.restore();
};

//
Player.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y)
    this.drawLife(this.life);
}

//
Player.prototype.handleInput = function(input){

    if (input !== undefined && window.status == Menu.gameState.inProgress){
        switch (input){
            case 'up':
                this.y -= (this.y - boardCoords.playerDefaults.moveY > boardCoords.minY) ? boardCoords.playerDefaults.moveY : 0;
                break;
            case 'down':
                this.y += (this.y + boardCoords.playerDefaults.moveY < boardCoords.maxY) ? boardCoords.playerDefaults.moveY : 0;
                break;
            case 'left':
                this.x -= (this.x - boardCoords.playerDefaults.moveX > boardCoords.minX) ? boardCoords.playerDefaults.moveX : 0;
                break;
            case 'right':
                this.x += (this.x + boardCoords.playerDefaults.moveX < boardCoords.maxX) ? boardCoords.playerDefaults.moveX : 0;
                break;
        }
    }
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [
    new Enemy(boardCoords.minX, boardCoords.streets[0])
    , new Enemy(boardCoords.minX, boardCoords.streets[1])
    , new Enemy(boardCoords.minX, boardCoords.streets[2])
    , new Enemy(boardCoords.minX, boardCoords.streets[0])
    , new Enemy(boardCoords.minX, boardCoords.streets[1])
    , new Enemy(boardCoords.minX, boardCoords.streets[2])
];

var player = new Player('images/char-boy.png');

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
