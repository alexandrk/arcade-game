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
    this.hitZone = {width: 90, height: 70};
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
var player = function(){

    this.sprite = 'images/char-boy.png';

    this.x = boardCoords.playerDefaults.startX;
    this.y = boardCoords.playerDefaults.startY;

    //
    this.update = function(dt){

        if (window.status == 'no action') {
            this.x = boardCoords.playerDefaults.startX;
            this.y = boardCoords.playerDefaults.startY;
        }

        //Collision Detection
        allEnemies.forEach(function(enemy){
            if (player.x < enemy.x + boardCoords.hitZone.width &&
               player.x + boardCoords.hitZone.width > enemy.x &&
               player.y < enemy.y + boardCoords.hitZone.height &&
               player.y + boardCoords.hitZone.height > enemy.y)
            {
                //console.log('collission detected: '+ enemy.number);
                //console.log('player: {'+ player.x + ', ' + player.y + '}');
                //console.log('enemy: {'+ enemy.x + ', ' + enemy.y + '}');
                window.setTimeout(function(){
                    //this.x = boardCoords.playerDefaults.startX;
                    //this.y = boardCoords.playerDefaults.startY;
                    window.status = 'collision detected';
                },
                200
                );
            }
        });

        // Successfully passed the bugs (considered a WIN)
        if (player.y <= boardCoords.streets[0]){
            window.status = 'level completed';
        }
    }

    //
    this.render = function(){
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y)
    }

    //
    this.handleInput = function(input){
        if (input !== undefined){
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
    }

    return this;

}();


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
