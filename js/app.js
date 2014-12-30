var CONSTANTS = new function(){
    this.FIELD = {
        width: 505,
        height: 535,
        info_bar_height: 83,
        winning_zone: 15
    };
    this.OBJECTS_PROPERTIES = {
        PLAYER: {
            SIZE: {
                width: 100,
                height: 100
            },
            DEFAULT: {
                x: this.FIELD.width / 2 - 50,
                y: this.FIELD.height / 2 + 87
            }
        },
        CELL_SIZE: {
            x: 100,
            y: 83
        },
        ENEMY: {
            default_x: -100,
            streets: [15, 100, 180]
        },
        START_BUTTON: {
            x: this.FIELD.width / 2 - 125,
            y: this.FIELD.height / 2 - 25,
            width: 250,
            height: 50
        }
    };
    this.HIT_ZONE = {
        width: 70,
        height: 70
    }
};

/**
 * Enemy - creates an enemy our player should avoid
 *  - randomly assigns street position
 *  - randomly assigns speed from the given speeds array
 *
 * @constructor
 */
var Enemy = function() {
    this.x = CONSTANTS.OBJECTS_PROPERTIES.ENEMY.default_x;
    this.y = CONSTANTS.OBJECTS_PROPERTIES.ENEMY.streets[
             getRandomIndex(CONSTANTS.OBJECTS_PROPERTIES.ENEMY.streets)];
    this.sprite = 'images/enemy-bug.png';
    this.speed = this.speeds('add');
};


Enemy.prototype.speeds = function(){
    var speeds = [50];

    return function(op){
        if (op === undefined || op === 'reset'){
            speeds = [50];
        }
        else if (op === 'add'){
            speeds.push(speeds[speeds.length - 1] + 25);
            return this.speeds('get');
        }
        else if (op === 'get'){
            return speeds[getRandomIndex(speeds)];
        }
        else if (op === 'show'){
            return speeds;
        }
    }
}();

/**
 * Update - updates the enemy's position, required method for game
 *
 * @param dt {integer} - a time delta between ticks
 */
Enemy.prototype.update = function(dt) {
    this.x += this.speed * dt;

    //reset enemy if reached end of screen
    if (this.x > CONSTANTS.FIELD.width + 100){
        this.reset();
    }
};

//
/**
 * Draw the enemy on the screen, required method for game
 */
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * Reset enemy
 *  - resets position, speed, street line
 */
Enemy.prototype.reset = function(){
    this.x = CONSTANTS.OBJECTS_PROPERTIES.ENEMY.default_x;
    this.y = CONSTANTS.OBJECTS_PROPERTIES.ENEMY.streets[
        getRandomIndex(CONSTANTS.OBJECTS_PROPERTIES.ENEMY.streets)];
    this.speed = this.speeds('get');
};

/**
 * Player - creates our player with all the properties
 *
 * @constructor
 */
var Player = function(){
    this.x = CONSTANTS.OBJECTS_PROPERTIES.PLAYER.DEFAULT.x;
    this.y = CONSTANTS.OBJECTS_PROPERTIES.PLAYER.DEFAULT.y;
    this.sprite = 'images/char-boy.png';
    this.collisionTriggered = false;
    this.dead = false;
    this.life = 3;
};

/**
 * Updates player position
 */
Player.prototype.update = function(){
    this.collisionDetection();
};

/**
 * Render's player on the game screen
 */
Player.prototype.render = function(){

    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);

    /* Draws heart shape lifes in the top left corner */
    interface.drawLife(this.life);
    game.render();

    /* Draw Collision message, if collision detected */
    if (this.collisionTriggered){
        interface.collisionDetected(this.life);
    }

    if (this.dead){
        interface.gameOver();
    }

    /* Draw Next Level Message, if level completed */
    if (this.y <= CONSTANTS.FIELD.winning_zone){
        interface.nextLevel(level.number + 1)
    }
};

/**
 * Resets player's position and collision trigger
 */
Player.prototype.resetPosition = function(){

    this.x = CONSTANTS.OBJECTS_PROPERTIES.PLAYER.DEFAULT.x;
    this.y = CONSTANTS.OBJECTS_PROPERTIES.PLAYER.DEFAULT.y;
    this.collisionTriggered = false;
};

/**
 * Checks for collisions between player and enemy objects
 */
Player.prototype.collisionDetection = function(){
    /*
     * Collision Detection Logic
     *  - Dependent on global allEnemies array
     *  + if collision found:
     *      - set collisionTriggered property on the player
     */
    if (!this.collisionTriggered){
        for (var i = 0; i < allEnemies.length; i++)
        {
            var enemy = allEnemies[i];
            if (this.x < enemy.x + CONSTANTS.HIT_ZONE.width &&
                this.x + CONSTANTS.HIT_ZONE.width > enemy.x &&
                this.y < enemy.y + CONSTANTS.HIT_ZONE.height &&
                this.y + CONSTANTS.HIT_ZONE.height > enemy.y)
            {
                this.collisionTriggered = true;
                break;
            }
        }
    }
};

/**
 * Update player life
 * @param tick
 */
Player.prototype.updateLife = function(tick){
    (this.life >= 0) ? this.life += tick : this.life;

    if (this.life <= 0){
        this.dead = true;
    }
}

/**
 * Handles keyboard input
 * @param direction
 * @note REFACTOR hardcoded values for going out of field boundaries
 */
Player.prototype.handleInput = function(direction){

    if (!this.collisionTriggered && !this.dead){
        var tempValue = 0;
        switch (direction){
            case "left":
                tempValue = this.x - CONSTANTS.OBJECTS_PROPERTIES.CELL_SIZE.x;
                if (tempValue > 0){
                    this.x = tempValue;
                }
                break;
            case "up":
                tempValue = this.y - CONSTANTS.OBJECTS_PROPERTIES.CELL_SIZE.y;
                if (tempValue > -(CONSTANTS.OBJECTS_PROPERTIES.PLAYER.SIZE.height)){
                    this.y = tempValue;
                }
                break;
            case "right":
                tempValue = this.x + CONSTANTS.OBJECTS_PROPERTIES.CELL_SIZE.x;
                if (tempValue < CONSTANTS.FIELD.width - CONSTANTS.OBJECTS_PROPERTIES.PLAYER.SIZE.width){
                    this.x = tempValue;
                }
                break;
            case "down":
                tempValue = this.y + CONSTANTS.OBJECTS_PROPERTIES.CELL_SIZE.y;
                if (tempValue < CONSTANTS.FIELD.height - CONSTANTS.OBJECTS_PROPERTIES.PLAYER.SIZE.height){
                    this.y = tempValue;
                }
                break;
        }
    }
    //console.log("{" + CONSTANTS.FIELD.width +", "+ CONSTANTS.FIELD.height + "}");
    //console.log("{" + player.x +", "+ player.y + "}");
};

var Game = function(){
    this.timeLeft = 30;
    this.timestamp = Date.now();

    this.updateTime = function(){

        if (Date.now() - this.timestamp > 1000) {
            this.timeLeft -= 1;
            this.timestamp = Date.now();
        }

        if (this.timeLeft == 0){
            player.updateLife(-1);
            this.resetTime();
        }
    };

    this.resetTime = function(){
        this.timeLeft = 30;
    };

    this.update = function(){
        this.updateTime();
    };

    this.render = function(){
        this.update();
        interface.renderTimeLeft(this.timeLeft);
    }
};

var Level = function(){
    this.number = this.reset();
};

Level.prototype.reset = function(){
    this.number = 1;
}

Level.prototype.levelUp = function(){
    this.number += 1;
    allEnemies.push(new Enemy());

    /* start removing slow speeds from the speeds array, every other level, after level 5 */
    if (this.number >= 5 && this.number % 2 > 0){
        Enemy.prototype.speeds('show').shift();
    }
};

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
document.addEventListener('startgame', startGame);

document.addEventListener('collision', function(e){
    player.updateLife(-1);
    interface.reset();
    player.resetPosition();
});

document.addEventListener('gameover', function(e){
    player.updateLife(-1);
    interface.startMenu();
});

document.addEventListener('levelcomplete', function(e){
    level.levelUp();
    game.resetTime();
    interface.reset();
    player.resetPosition();
});

// Start the game
var interface = new Interface(),
    level = new Level(),
    game = new Game(),
    allEnemies = [],
    player;

function startGame(){
    Enemy.prototype.speeds('reset');
    game.resetTime();
    level.reset();
    allEnemies = [new Enemy()];
    player = new Player();
}

/* Helper Functions */

function getRandomIndex(array){
    return Math.floor(Math.random() * array.length);
}

startGame();