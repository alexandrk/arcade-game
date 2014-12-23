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

/* -----------------====| Enemy |====----------------- */
/*
 * Creates an enemy entity
 * @constructor
 */
var Enemy = function() {
    this.sprite = 'images/enemy-bug.png';
    this.number = this.getNumber();
    this.reset();
}

/*
 * Function: getNumber
 * Assigns each enemy a unique auto-incremented identifier
 */
Enemy.prototype.getNumber = function(){
    var i = 1;
    return function(){return i++};
}();

/*
 * Function: getSpeed
 * Returns random speed for enemy movements
 */
Enemy.prototype.getSpeed = function(){
    var speeds = [50, 75, 100, 125, 150, 175, 200, 225, 250];
    var randomArrayIndex = Math.floor(Math.random() * speeds.length);
    return speeds[randomArrayIndex];
}

/*
 * Function: update
 * Update the enemy's position
 * @param {float} dt - a time delta between ticks
 */
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter to ensure
    // the game runs at the same speed on different devices
    this.x += this.speed * dt;

    if (this.x > boardCoords.maxX + 100) {
        this.reset();
    }
};

/*
 * Function: reset
 * Resets enemy to a random street and assigns random speed
 */
Enemy.prototype.reset = function(){
    this.x = boardCoords.minX;
    this.y = boardCoords.streets[Math.floor(Math.random() * boardCoords.streets.length)];
    this.speed = this.getSpeed();
}

/*
 * Function: render
 * Draw the enemy on the screen, required method for game
 */
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


/* -----------------====| Player |====----------------- */
/*
 * Creates a player entity with specified character image
 * @constructor
 */
var Player = function(character)
{
    this.sprite = character;
    this.reset(true);
};

/*
 * Function: reset
 *  - resets players x, y coordinates to the default
 *  - @param {bool} resetLife - triggers players life reset to default value
 */
Player.prototype.reset = function(resetLife)
{
    // default value for the reset life parameter (true)
    resetLife = (resetLife == 'undefined') ? true : resetLife;

    this.x = boardCoords.playerDefaults.startX;
    this.y = boardCoords.playerDefaults.startY;

    this.life = (resetLife) ? 3 : this.life;
};

/*
 * Function: update
 * Updates the players position
 * @param {float} dt - a time delta between ticks
 */
Player.prototype.update = function(dt)
{
    /* Reset player to the default coordinates, if game is in one of the following states */
    if (window.status == Menu.gameState.newGame ||
        window.status == Menu.gameState.reset ||
        window.status == Menu.gameState.restart
    ){

        /* Reset player's life, if game state is 'newGame' */
        var resetLife = (window.status == Menu.gameState.newGame);
        this.reset(resetLife);

        /* Change game state to 'inProgress' */
        window.status = Menu.gameState.inProgress;
    }

    /*
     * Collision Detection Logic
     *  - Dependent on global allEnemies array
     *  + if collision found:
     *      - game state is updated to 'collision'
     *      - player's life is decreased
     */
    for (var i = 0; i < allEnemies.length; i++)
    {
        var enemy = allEnemies[i];
        if (this.x < enemy.x + boardCoords.hitZone.width &&
           this.x + boardCoords.hitZone.width > enemy.x &&
           this.y < enemy.y + boardCoords.hitZone.height &&
           this.y + boardCoords.hitZone.height > enemy.y)
        {
            window.status = Menu.gameState.collision;
            this.life -= 1;
            break;
        }
    }

    /*
     * Game Over, no life left
     *  - game state is updated to 'gameOver'
     */
    if (this.life <= 0){
        window.status = Menu.gameState.gameOver;
    }
    /*
     * Successfully reached the river
     *  - game state is updated to 'levelCompleted'
     */
    else if (this.y <= boardCoords.streets[0]){

        Level.levelUp();
        Level.render();

        window.status = Menu.gameState.levelCompleted;
    }

    game.updateTime(dt);
};

/*
 * Function: drawLife
 * Helper function to draw players lives left in heart shapes
 */
Player.prototype.drawLife = function(life)
{
    ctx.save();
    ctx.fillStyle = "rgba(255, 0, 0, 0.7)"
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

/*
 * Function: render
 * Draw the player on the screen, based on:
 *  - this.sprite
 *  - this.x
 *  - this.y
 * Draws players life left
 */
Player.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y)
    this.drawLife(this.life);
    game.render();
}

/*
 * Function: handleInput
 * Listen for control keys, if game state is 'inProgress'
 * Prevent player's character to go off screen
 */
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

//
var Level = new function(){
    this.number = 1;

    this.levelUp = function(){
        this.number++;
        game.resetTime();
        allEnemies.push(new Enemy());
    };

    this.reset = function(){
        this.number = 1;
        allEnemies = [new Enemy()];
    }

    this.getNextLevelMessage = function(){
        return "Level " + this.number;
    }

    this.render = function(){
        ctx.fillText("Level " + this.number, ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.strokeText("Level " + this.number, ctx.canvas.width / 2, ctx.canvas.height / 2);
    }
};

var Game = function(){
    this.points = 0;
    this.timeLeft = 30;
    this.timestamp = Date.now();

    this.updateTime = function(dt){

        if (Date.now() - this.timestamp > 1000) {
            this.timeLeft -= 1;
            this.timestamp = Date.now();
            console.log(this.timestamp);
        }

        if (this.timeLeft == 0){
            player.life -= 1;
            this.resetTime();
        }
    };

    this.render = function(){
        this.renderTimeLeft();
    };

    this.renderTimeLeft = function()
    {
        ctx.save();
            ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctx.textAlign = "left";
            ctx.fillText("Time Left: " + this.timeLeft.toString(), Constants.canvasWidth / 2, Constants.infoBarHeight - 25);
        ctx.restore();
    };

    this.resetTime = function(){
        this.timeLeft = 30;
    }
};

var game = new Game();


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];

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