var Menu = new function(){


        /*
         * Function: Start Menu
         * Description: shows menu overlay
         */
    this.startMenu = function(){


        shadeCurrentCanvas();

        drawStartButton();

        // Add Events to the Canvas
        canvas.addEventListener('mousemove', buttonOver, false);
        canvas.addEventListener('click', startGame, false);

        // Update Global State of the game
        window.status = 'no action';
    };

    /*
     * Function: drawStartButton
     * Description: draws the button on the canvas
     * Parameters: {type} - determines style change
     */
    function drawStartButton(type){

        ctx.strokeStyle = "#555555";
        ctx.lineWidth = 2;
        ctx.font = "35pt impact";
        ctx.textAlign = "center";

        if (type == 'over'){
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
    function startGame(evt){

        if (withInStartButton(evt)){
            //move player to start, based on status
            player.update();
            window.status = 'in progress';

            // Removes event listeners that are only used in the start menu
            canvas.removeEventListener('mousemove', buttonOver, false);
            canvas.removeEventListener('click', startGame, false);
        }
    }

    /*
     * Function: buttonOver
     * Description: event handler for when the cursor is over the button
     */
    function buttonOver(evt){

        if (withInStartButton(evt)){
            evt.target.style.cursor = 'pointer';
            drawStartButton('over');
        }
        else{
            evt.target.style.cursor = 'default';
            drawStartButton();
        }

    }

    /*
     * Function: shadeCurrentCanvas
     * Description: helper, shades current state of the canvas
     */
    function shadeCurrentCanvas(){
        var currentCanvas = ctx.getImageData(0, 0, Constants.canvasWidth, Constants.canvasHeight);
        var pixels = currentCanvas.data.length / 4;
        for (var i = 0; i < pixels; i++){
            currentCanvas.data[i * 4 + 3] = 125;
        }
        ctx.putImageData(currentCanvas, 0, 0);
    }

    /* Function withInStartButton
     * Description: helper, used in determining start button borders
     */
    function withInStartButton(evt){
        var mouseX = evt.clientX - canvas.offsetLeft,
            mouseY = evt.clientY - canvas.offsetTop;

        return (
            mouseX >=  ((Constants.canvasWidth / 2 ) - (Constants.startButtonWidth / 2)) &&
            mouseX <=  ((Constants.canvasWidth / 2 ) + (Constants.startButtonWidth / 2)) &&
            mouseY >=  ((Constants.canvasHeight / 2 ) - (Constants.startButtonHeight / 2)) &&
            mouseY <=  ((Constants.canvasHeight / 2 ) + (Constants.startButtonHeight / 2))
        );
    }

    /*
     * Function: drawRoundedRectanle
     * Description: helper func, used to draw rounded button rectangle
     */
    function drawRoundedRectanle(x, y, width, height, r){

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
        ctx.fill();
        ctx.stroke();
    }

    /*
     * Function: levelCompleted
     */
    this.levelCompleted = function(){

        shadeCurrentCanvas();
        ctx.fillStyle = '#00cc00';
        ctx.fillRect(0, 0, Constants.canvasWidth, Constants.infoBarHeight);

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = 'black';
        ctx.fillText('Completed', Constants.canvasWidth / 2, Constants.infoBarHeight - 20);
        ctx.strokeText('Completed', Constants.canvasWidth / 2, Constants.infoBarHeight - 20);

    }

    /*
     * Function: collisionDetected
     */
    this.collisionDetected = function(){
        shadeCurrentCanvas();
        ctx.fillStyle = '#cc0000';
        ctx.strokeStyle = 'black';
        ctx.fillRect(0, 0, Constants.canvasWidth, Constants.infoBarHeight);

        ctx.fillStyle = '#ffffff';
        ctx.fillText('Failed', Constants.canvasWidth / 2, Constants.infoBarHeight - 20);
        ctx.strokeText('Failed', Constants.canvasWidth / 2, Constants.infoBarHeight - 20);

    }
};