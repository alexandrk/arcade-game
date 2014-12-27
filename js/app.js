var CONSTANTS = new function(){
    this.FIELD = {
        width: 505,
        height: 535
    };
    this.OBJECTS_PROPERTIES = {
        PLAYER: {
            SIZE: {
                width: 100,
                height: 100
            },
            DEFAULT: {
                x: this.FIELD.width / 2 - 50,
                y: this.FIELD.height / 2 + 138
            }
        },
        CELL_SIZE: {
            x: 100,
            y: 83
        },
        ENEMY: {
            default_x: -100,
            streets: [60, 145, 230]
        }
    };
};

// Enemies our player must avoid
var Enemy = function() {
    this.x = CONSTANTS.OBJECTS_PROPERTIES.ENEMY.default_x;
    this.y = CONSTANTS.OBJECTS_PROPERTIES.ENEMY.streets[2];
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    this.x += 50 * dt;

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
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(){
    this.x = CONSTANTS.OBJECTS_PROPERTIES.PLAYER.DEFAULT.x;
    this.y = CONSTANTS.OBJECTS_PROPERTIES.PLAYER.DEFAULT.y;
    this.sprite = 'images/char-boy.png';
};

Player.prototype.update = function(x, y){

};

Player.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 *
 * @param direction
 * @note REFACTOR hardcoded values for going out of field boundaries
 */
Player.prototype.handleInput = function(direction){
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
            if (tempValue > -50){
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
    //console.log("{" + CONSTANTS.FIELD.width +", "+ CONSTANTS.FIELD.height + "}");
    console.log("{" + player.x +", "+ player.y + "}");
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

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