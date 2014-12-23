var Menu = new function() {

    this.gameState = {
        collision: 'collision detected',
        levelCompleted: 'level completed',
        newGame: 'new game',
        gameOver: 'game over',
        initialization: 'initial load',
        inProgress: 'in progress',
        playAgain: ' play again',
        restart: 'restart',
        reset: 'resetPlayer'
    };

    this.countDown = 100;
    this.doFadingMessage = true;

    /*
     * Function: Start Menu
     * Description: shows menu overlay
     */
    this.startMenu = function () {
        shadeCurrentCanvas();
        drawStartButton();

        // Add Events to the Canvas
        ctx.canvas.addEventListener('mousemove', buttonOver, false);
        ctx.canvas.addEventListener('click', startGame, false);
    };

    /*
     * Function: drawStartButton
     * Description: draws the button on the canvas
     * Parameters: {type} - determines style change
     */
    function drawStartButton(type) {
        ctx.strokeStyle = "#555555";
        ctx.lineWidth = 2;
        ctx.font = "35pt impact";
        ctx.textAlign = "center";

        if (type == 'over') {
            ctx.fillStyle = "#52864C";

        }
        else {
            var my_gradient = ctx.createLinearGradient(Constants.startButtonX,
                Constants.startButtonY,
                Constants.startButtonX,
                Constants.startButtonY + Constants.startButtonHeight);
            my_gradient.addColorStop(0, "#52864C");
            my_gradient.addColorStop(1, "#A2DE7C");
            ctx.fillStyle = my_gradient;
        }
        drawRoundedRectanle(Constants.startButtonX, Constants.startButtonY, Constants.startButtonWidth, Constants.startButtonHeight, 10, ctx.fillStyle);

        ctx.fillStyle = "white";
        ctx.fillText("Start", Constants.startButtonX + 120, Constants.startButtonY + 42);
        ctx.strokeText("Start", Constants.startButtonX + 120, Constants.startButtonY + 42);
    }

    /*
     * Function: startGame
     * Description: event handler for 'Start' menus button click
     */
    function startGame(evt) {

        if (withInStartButton(evt)) {

            window.status = Menu.gameState.newGame;
            Level.reset();

            // Removes event listeners that are only used in the start menu
            ctx.canvas.removeEventListener('mousemove', buttonOver, false);
            ctx.canvas.removeEventListener('click', startGame, false);
        }
    }

    /*
     * Function: buttonOver
     * Description: event handler for when the cursor is over the button
     */
    function buttonOver(evt) {

        if (withInStartButton(evt)) {
            evt.target.style.cursor = 'pointer';
            drawStartButton('over');
        }
        else {
            evt.target.style.cursor = 'default';
            drawStartButton();
        }
    }

    /*
     * Function: shadeCurrentCanvas
     * Description: helper, shades current state of the canvas
     */
    function shadeCurrentCanvas() {
        var currentCanvas = ctx.getImageData(0, 0, Constants.canvasWidth, Constants.canvasHeight);
        var pixels = currentCanvas.data.length / 4;
        for (var i = 0; i < pixels; i++) {
            currentCanvas.data[i * 4 + 3] = 125;
        }
        ctx.putImageData(currentCanvas, 0, 0);
    }

    /* Function withInStartButton
     * Description: helper, used in determining start button borders
     */
    function withInStartButton(evt) {
        var mouseX = evt.clientX - ctx.canvas.offsetLeft,
            mouseY = evt.clientY - ctx.canvas.offsetTop;

        return (
        mouseX >= ((Constants.canvasWidth / 2 ) - (Constants.startButtonWidth / 2)) &&
        mouseX <= ((Constants.canvasWidth / 2 ) + (Constants.startButtonWidth / 2)) &&
        mouseY >= ((Constants.canvasHeight / 2 ) - (Constants.startButtonHeight / 2)) &&
        mouseY <= ((Constants.canvasHeight / 2 ) + (Constants.startButtonHeight / 2))
        );
    }

    /*
     * Function: drawRoundedRectanle
     * Description: helper func, used to draw rounded button rectangle
     */
    function drawRoundedRectanle(x, y, width, height, r) {

        //console.log(ctx.fillStyle);

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
    }

    /*
     * Function: levelCompleted
     */
    this.levelCompleted = function()
    {
        var color = "0, 200, 0";
        var message = Level.getNextLevelMessage();

        this.fadeMessage(color, message, true);
    };

    this.fadeMessage = function(color, message, doRestart){

        shadeCurrentCanvas();

        ctx.fillStyle = "rgba("+ color +", "+ this.countDown / 100 +")";
        ctx.fillRect(0, 0, Constants.canvasWidth, Constants.infoBarHeight);

        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fillText(message, Constants.canvasWidth / 2, Constants.infoBarHeight - 20);

        this.countDown -= 2;

        if (this.countDown <= 0){
            this.countDown = 100;

            if (doRestart)
                this.restart();
            else{
                this.doFadingMessage = false;
                this.startMenu();
            }
        }
    }

    /*
     * Function: collisionDetected
     */
    this.collisionDetected = function()
    {
        var color = "255, 150, 0";
        var message = "Failed!";

        this.fadeMessage(color, message, true);
    };

    /*
     * Function: gameOver
     */
    this.gameOver = function()
    {
        var color = "200, 0, 0";
        var message = "Game Over!";

        if (this.doFadingMessage) {
            this.fadeMessage(color, message, false);
        }
    }

    this.restart = function(){
        this.doFadingMessage = true;
        window.status = Menu.gameState.restart;
    }
};