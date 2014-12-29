var CONSTANTS = new function(){
    this.FIELD = {
        width: 505,
        height: 535,
        infoBarHeight: 83
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

// Enemies our player must avoid
var Enemy = function() {
    this.x = CONSTANTS.OBJECTS_PROPERTIES.ENEMY.default_x;
    this.y = CONSTANTS.OBJECTS_PROPERTIES.ENEMY.streets[0];
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    this.x += 100 * dt;

    //reset enemy if reached end of screen
    if (this.x > CONSTANTS.FIELD.width + 100){
        this.reset();
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);

    // test
    //ctx.fillRect(this.x - 100, this.y, 101, 171);

};

Enemy.prototype.reset = function(){
    this.x = CONSTANTS.OBJECTS_PROPERTIES.ENEMY.default_x;
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(){
    this.x = CONSTANTS.OBJECTS_PROPERTIES.PLAYER.DEFAULT.x;
    this.y = CONSTANTS.OBJECTS_PROPERTIES.PLAYER.DEFAULT.y;
    this.sprite = 'images/char-boy.png';
    this.collisionTriggered = false;
    this.timeOutSet = false;
    this.life = 2;
    this.gameOver = false;
};

Player.prototype.update = function(x, y){
};

Player.prototype.render = function(){
    var that;

    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    interface.drawLife(this.life);

    this.collisionDetection();

    if (this.collisionTriggered){
        /* If collision happened on the last life, skipped display of the "Failed" message */
        if (this.life > 1){
            interface.collisionDetected();
        } else if (this.life <= 1) {
            this.gameOver = true;
            interface.gameOver();
        }
        /* Delaying the call to reset and updateLife functions
         * so that the message animation will complete. Trigger
         * used to limit setTimeout to one time, instead of setting
         * it on every frame of requestAnimationFrame */
        if (! this.timeOutSet){
            console.log(interface.countDown);
            that = this;
            window.setTimeout(function(){
                that.updateLife(-1);
                that.reset();
            }, 820);
        }

        this.timeOutSet = true;
    }
};

Player.prototype.reset = function(){

    /* if NOT game over, reset player position to default;
       reset collision and animation triggers */
    if (! this.gameOver) {
        this.x = CONSTANTS.OBJECTS_PROPERTIES.PLAYER.DEFAULT.x;
        this.y = CONSTANTS.OBJECTS_PROPERTIES.PLAYER.DEFAULT.y;

        this.collisionTriggered = false;
        this.timeOutSet = false;
    }

    console.log('in reset');

    // resets the count down value used to show animation
    interface.reset();
};

Player.prototype.collisionDetection = function(){
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
        if (this.x < enemy.x + CONSTANTS.HIT_ZONE.width &&
            this.x + CONSTANTS.HIT_ZONE.width > enemy.x &&
            this.y < enemy.y + CONSTANTS.HIT_ZONE.height &&
            this.y + CONSTANTS.HIT_ZONE.height > enemy.y)
        {
            this.collisionTriggered = true;
            break;
        }
    }
    return false;
};

Player.prototype.updateLife = function(tick){
    this.life += tick;
}

/**
 *
 * @param direction
 * @note REFACTOR hardcoded values for going out of field boundaries
 */
Player.prototype.handleInput = function(direction){

    if (!this.collisionTriggered){
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

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var interface = new Interface();
var allEnemies = [new Enemy()];
var player = new Player();


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
document.addEventListener('startgame', function(e) {
    alert('New Game');
    player.reset();
});