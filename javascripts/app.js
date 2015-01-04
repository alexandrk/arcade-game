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

/**
 * Function utilizing closure to store speeds array
 * has different operations that it accepts {string}:
 *   - reset - resets the speeds array to default
 *   - add - adds a new speed to the array
 *   - get - returns a random speed from the array
 *   - show - returns the whole array
 */
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
    this.collided = false;
    this.dead = false;
    this.life = 3;
};

/**
 * Updates player position
 */
Player.prototype.update = function(){
};

/**
 * Renders player on the game screen
 */
Player.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * Resets player's position and collision trigger
 */
Player.prototype.resetPosition = function(){
    this.x = CONSTANTS.OBJECTS_PROPERTIES.PLAYER.DEFAULT.x;
    this.y = CONSTANTS.OBJECTS_PROPERTIES.PLAYER.DEFAULT.y;
    this.collided = false;
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

    if (!this.collided && !this.dead){
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
};

/**
 * Game wrapper
 */
var Game = function(){
    this.timeLeft = 30;
    this.timestamp = Date.now();
    this.collisionTriggered = false;
    this.levelCompleted = false;
    this.gameOver = false;
    this.level = 1;
    this.score = 0;
    this.prevScore = 0;

    /**
     * Updates time left (basic countdown from default to 0)
     */
    this.updateTime = function(){
        if (Date.now() - this.timestamp > 1000) {
            this.timeLeft -= 1;
            this.timestamp = Date.now();
        }

        /* if no time left, remove one life and reset the clock */
        if (this.timeLeft == 0){
            this.player.updateLife(-1);
            this.resetTime();
        }
    };

    /**
     * Resets time to default
     */
    this.resetTime = function(){
        this.timeLeft = 30;
    };

    /**
     * Updates total score:
     *   - each level is 50 points
     *   - each second of time left is 1 point
     */
    this.updateScore = function(){
        this.score = this.level * 50 + this.timeLeft;
    };

    /**
     * Resets score to 0 (prevScore is used in the score animation)
     */
    this.resetScore = function(){
        this.score = 0;
        this.prevScore = 0;
    };

    /**
     * Updates for all game entities happen here
     * @param dt
     */
    this.update = function(dt){
        this.player.update();

        /* collision detection function, sets this.collisionTriggered to TRUE on collision */
        this.collisionDetection();

        /* player.collided is used in player.handleInput to prevent player from moving */
        this.player.collided = this.collisionTriggered;

        /* check for level completion */
        this.levelCompleted = (this.player.y <= CONSTANTS.FIELD.winning_zone);

        /* stop time when level completed or game is over */
        if (!this.levelCompleted && !this.gameOver){
            this.updateTime();
        }

        /* run updates on all the enimies */
        this.allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
    };

    /**
     * Resets the game states
     */
    this.reset = function(){
        this.level = 1;
        this.resetTime();
        this.resetScore();
        this.levelCompleted = false;
        this.gameOver = false;
    }

    /**
     * Renders all game elements
     */
    this.render = function(){
        this.player.render();
        this.interface.drawLife(this.player.life);
        this.interface.renderTimeLeft(this.timeLeft);

        /* Render enemies */
        this.allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        /* Draw Collision message, if collision detected */
        if (this.collisionTriggered){
            this.interface.collisionDetected();
        }

        /* render score calculation,  */
        if (this.levelCompleted){
            this.updateScore();
            this.interface.nextLevel(this.level + 1, this.score);
            this.interface.animateScore(this.prevScore, this.score);
        }
        else{
            this.interface.renderScore(this.score);
        }

        /* Draws game over message */
        if (this.player.dead){
            this.gameOver = true;
            this.interface.gameOver();
        }
    };

    /**
     * Recreates the start game states for all the entities
     */
    this.newGame = function(){
        Enemy.prototype.speeds('reset');

        this.interface  = new Interface();
        this.player     = new Player();
        this.allEnemies = [new Enemy()];

        this.reset();
    };

    /**
     * Checks for collisions between player and enemy objects
     * @returns {boolean} - used to set collisionTriggered
     */
    this.collisionDetection = function(){
        /*
         * Collision Detection Logic
         *  - Dependent on global allEnemies array
         *  + if collision found:
         *      - set collisionTriggered property on the player
         */
        if (!this.collisionTriggered){
            for (var i = 0; i < this.allEnemies.length; i++)
            {
                var enemy = this.allEnemies[i];
                if (this.player.x < enemy.x + CONSTANTS.HIT_ZONE.width &&
                    this.player.x + CONSTANTS.HIT_ZONE.width > enemy.x &&
                    this.player.y < enemy.y + CONSTANTS.HIT_ZONE.height &&
                    this.player.y + CONSTANTS.HIT_ZONE.height > enemy.y)
                {
                    this.collisionTriggered = true;
                    break;
                }
            }
        }
    };

    /**
     * Is executed after the collision animation finishes
     */
    this.collisionCallback = function(){
        this.player.updateLife(-1);
        this.player.resetPosition();

        /* resets animation counters in the interface class */
        this.interface.reset();

        this.collisionTriggered = false;
    };

    /**
     * Is executed after the level completed animation finishes
     */
    this.levelCompletedCallback = function(){
        this.prevScore = this.score;
        this.player.resetPosition();
        this.interface.reset();
        this.level += 1;

        /* start removing slow speeds from the speeds array,
           every other level, after level 5 */
        if (this.level >= 5 && this.level % 2 > 0){
            Enemy.prototype.speeds('show').shift();
        }
        this.allEnemies.push(new Enemy());

        this.resetTime();
    };

    /**
     * Is executed after game over animation finishes
     */
    this.gameOverCallback = function(){
        this.interface.startMenu();
    }
};

// Start the game
var game = new Game();
game.newGame();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keydown', function(e) {

    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    if (allowedKeys[e.keyCode] !== undefined){
        e.preventDefault();
    }

    game.player.handleInput(allowedKeys[e.keyCode]);
});

document.addEventListener('startgame',      game.newGame.bind(game));
document.addEventListener('collision',      game.collisionCallback.bind(game));
document.addEventListener('gameover',       game.gameOverCallback.bind(game));
document.addEventListener('levelcomplete',  game.levelCompletedCallback.bind(game));

/* event handler for touch events */
document.addEventListener('touchstart',   handleTouch, false);

/**
 * Gets the position of the touch event and converts it to the direction,
 * which than gets passed to player.handleInput for processing
 * @param e - event object
 */
function handleTouch(e) {

    var touch = {
        x: e.touches[0].pageX - ctx.canvas.offsetParent.offsetLeft - ctx.canvas.offsetLeft,
        y: e.touches[0].pageY - ctx.canvas.offsetParent.offsetTop - ctx.canvas.offsetTop - 70
    };
    var move;

    if (touch.x < game.player.x &&
        touch.y > game.player.y &&
        touch.y < game.player.y + CONSTANTS.OBJECTS_PROPERTIES.CELL_SIZE.y){
        move = 'left';
    }else if (touch.y < game.player.y &&
        touch.x > game.player.x &&
        touch.x < game.player.x + CONSTANTS.OBJECTS_PROPERTIES.CELL_SIZE.x) {
        move = 'up';
    }else if (touch.x > game.player.x + CONSTANTS.OBJECTS_PROPERTIES.CELL_SIZE.x &&
        touch.y > game.player.y &&
        touch.y < game.player.y + CONSTANTS.OBJECTS_PROPERTIES.CELL_SIZE.y){
        move = 'right';
    }else if (touch.y > game.player.y + CONSTANTS.OBJECTS_PROPERTIES.CELL_SIZE.y &&
        touch.x > game.player.x &&
        touch.x < game.player.x + CONSTANTS.OBJECTS_PROPERTIES.CELL_SIZE.x) {
        move = 'down';
    }

    /* condition needed to detect button click on the Restart button */
    if (!game.gameOver && move !== undefined){
        e.preventDefault();
    }

    game.player.handleInput(move);
}

/* Helper Functions */
function getRandomIndex(array){
    return Math.floor(Math.random() * array.length);
}