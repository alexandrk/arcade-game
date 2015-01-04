var Interface = function() {

    this.countDown = 100;
    this.mouseXY = {
        clientX: 0,
        clientY: 0
    };
    this.reset();

    ctx.strokeStyle = "#555555";
    ctx.lineWidth = 2;
    ctx.font = "25pt 'Sigmar One'";
    ctx.textAlign = "center";
    ctx.save();

    // Add Events to the Canvas
    ctx.canvas.addEventListener('mousemove', this.buttonOver.bind(this), false);
    ctx.canvas.addEventListener('click',     this.startGame.bind(this), false);
};

/**
 * Event handler for 'Start' menu button click
 */
Interface.prototype.startGame = function(evt)
{
    if (this.withinStartButton(evt))
    {
        document.dispatchEvent(new CustomEvent('startgame'));
    }
};

/**
 * Event handler for when the cursor is over the button
 */
Interface.prototype.buttonOver = function(evt)
{
    if (this.withinStartButton(evt)) {
        evt.target.style.cursor = 'pointer';
    }
    else {
        evt.target.style.cursor = 'default';
    }
};

/**
 * Resets counts used for animation
 */
Interface.prototype.reset = function(){
    this.countDown = 100;
    this.countUp = 0;
    this.scoreUp = 0;
};

/**
 * Draws collision message
 */
Interface.prototype.collisionDetected = function()
{
    var color = "255, 150, 0",
        message = "Failed!",
        finished = this.showMessage(color, message, "down", false);

    if (finished) {
        document.dispatchEvent(new CustomEvent('collision'));
    }
};

/**
 * Draws game over message
 */
Interface.prototype.gameOver = function()
{
    var color = "200, 0, 0",
        message = "Game Over!",
        finished = this.showMessage(color, message, "up", true);

    if (finished) {
        document.dispatchEvent(new CustomEvent('gameover'));
    }

};

/**
 * Draws level completed message
 */
Interface.prototype.nextLevel = function(level, score)
{
    var color = "0, 200, 0",
        message = "Level " + level,
        finished = this.showMessage(color, message, "down", false);

    if (finished && this.scoreUp >= score) {
        document.dispatchEvent(new CustomEvent('levelcomplete'));
    }
};

/**
 * Draws time left in the game
 * @param timeLeft {number} - number of seconds left
 */
Interface.prototype.renderTimeLeft = function(timeLeft)
{
    ctx.save();

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.textAlign = "left";
    ctx.fillText("Time: " + timeLeft.toString(),
        30, ctx.canvas.height - 20);

    ctx.restore();
};

/**
 * Draws player's lives left in heart shapes
 * @param life {number} - number of lives
 */
Interface.prototype.drawLife = function(life)
{
    ctx.save();

    ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
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

Interface.prototype.animateScore = function(fromScore, toScore){

    this.scoreUp = (this.scoreUp >= fromScore) ? this.scoreUp : fromScore;

    if (this.scoreUp < toScore) {
        this.renderScore(this.scoreUp);
        this.scoreUp += 1;
    }
};

/**
 * Draws current score
 * @param score {number} - game score
 */
Interface.prototype.renderScore = function(score)
{
    ctx.save();

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.textAlign = "right";
    ctx.fillText("Score: "+ score,
        ctx.canvas.width - 30, ctx.canvas.height - 20);

    ctx.restore();
};

/**
 * Displays fadeIn/fadeOut animation on custom messages
 *
 * @param color {string} - Color for Background of the message
 * @param fadeDirection {string} - specifies the direction of the fade ('up'|'down')
 * @param message {string} - Message text
 * @param doRestart {boolean} - call Interface.startMenu (used on Game Over)
 */
Interface.prototype.showMessage = function(color, message, fadeDirection, doRestart)
{

    /* return true, if the animation is complete */
    if ((this.countDown < 0 && fadeDirection === 'down') ||
        (this.countUp > 100 && fadeDirection === 'up')
    ){
        return true;
    }

    ctx.save();

    var count = (fadeDirection === 'up') ? this.countUp : this.countDown;

    // Sacrifices, since is really slow on mobile
    //this.shadeCurrentCanvas();

    ctx.fillStyle = "rgba("+ color +", "+ count / 100 +")";
    ctx.fillRect(0, 0, ctx.canvas.width, CONSTANTS.FIELD.info_bar_height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillText(message, ctx.canvas.width / 2, CONSTANTS.FIELD.info_bar_height- 25);

    if (fadeDirection === 'down'){
        this.countDown -= 2;
    } else if (fadeDirection === 'up'){
        this.countUp += 2;
    }
    ctx.restore();

    return false;
};

/**
 * Shows start menu overlay
 */
Interface.prototype.startMenu = function () {
    //this.shadeCurrentCanvas();
    this.drawStartButton();
};

/**
 * Helper, shades current state of the canvas
 */
Interface.prototype.shadeCurrentCanvas = function()
{
    ctx.save();

    var currentCanvas = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    var pixels = currentCanvas.data.length / 4;
    for (var i = 0; i < pixels; i++) {
        currentCanvas.data[i * 4 + 3] = 125;
    }
    ctx.putImageData(currentCanvas, 0, 0);
    ctx.restore();
};

/**
 * Draws the start button on the canvas
 *
 * @param type {string} - determines style change
 */
Interface.prototype.drawStartButton = function()
{
    ctx.save();

    var type, my_gradient;

    if (this.withinStartButton()){
        type = 'over';
    }

    if (type == 'over') {
        ctx.fillStyle = "#52864C";
    }
    else {
        my_gradient = ctx.createLinearGradient(
            CONSTANTS.OBJECTS_PROPERTIES.START_BUTTON.x,
            CONSTANTS.OBJECTS_PROPERTIES.START_BUTTON.y,
            CONSTANTS.OBJECTS_PROPERTIES.START_BUTTON.x,
            CONSTANTS.OBJECTS_PROPERTIES.START_BUTTON.y +
            CONSTANTS.OBJECTS_PROPERTIES.START_BUTTON.height
        );
        my_gradient.addColorStop(0, "#52864C");
        my_gradient.addColorStop(1, "#A2DE7C");
        ctx.fillStyle = my_gradient;
    }
    this.drawRoundedRectanle(CONSTANTS.OBJECTS_PROPERTIES.START_BUTTON.x,
                             CONSTANTS.OBJECTS_PROPERTIES.START_BUTTON.y,
                             CONSTANTS.OBJECTS_PROPERTIES.START_BUTTON.width,
                             CONSTANTS.OBJECTS_PROPERTIES.START_BUTTON.height,
                             10, ctx.fillStyle);

    ctx.fillStyle = "white";
    ctx.fillText("Restart",
                 CONSTANTS.OBJECTS_PROPERTIES.START_BUTTON.x + 120,
                 CONSTANTS.OBJECTS_PROPERTIES.START_BUTTON.y + 35);
    ctx.strokeText("Restart",
                 CONSTANTS.OBJECTS_PROPERTIES.START_BUTTON.x + 120,
                 CONSTANTS.OBJECTS_PROPERTIES.START_BUTTON.y + 35);
    ctx.restore();
};

/**
 * Helper, used in determining start button borders
 *   - utilized in button hover and button click
 */
Interface.prototype.withinStartButton = function(evt)
{
    if (evt !== undefined){
        this.mouseXY.clientX = evt.pageX;
        this.mouseXY.clientY = evt.pageY;
    }

    var mouseX = this.mouseXY.clientX - ctx.canvas.offsetParent.offsetLeft - ctx.canvas.offsetLeft,
        mouseY = this.mouseXY.clientY - ctx.canvas.offsetParent.offsetTop - ctx.canvas.offsetTop;

    return (
    mouseX >= ((ctx.canvas.width / 2 ) - (CONSTANTS.OBJECTS_PROPERTIES.START_BUTTON.width / 2)) &&
    mouseX <= ((ctx.canvas.width / 2 ) + (CONSTANTS.OBJECTS_PROPERTIES.START_BUTTON.width / 2)) &&
    mouseY >= ((ctx.canvas.height / 2 ) - (CONSTANTS.OBJECTS_PROPERTIES.START_BUTTON.height / 2)) &&
    mouseY <= ((ctx.canvas.height / 2 ) + (CONSTANTS.OBJECTS_PROPERTIES.START_BUTTON.height / 2))
    );
};

/**
 * Helper, used to draw rounded button rectangle
 */
Interface.prototype.drawRoundedRectanle = function(x, y, width, height, r)
{
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
};