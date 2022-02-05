
function draw(mazeState){

    // Offset used so that the maze boarders show clearly around the maze.
    const canvasOffset = 1;

    // Get the canvas context to enable drawing on it.
    const canvas = document.getElementById("my-canvas");
    const context = canvas.getContext("2d");

    
    context.strokeStyle = "rgb(50, 50, 50)";
    context.lineWidth = 1;

    const cellPx = mazeState.maze.get_cell_size();
    const heightCell = mazeState.maze.get_grid_y();
    const widthCell = mazeState.maze.get_grid_x();

    let overlay_data = mazeState.maze.get_grid_overlay();
    
    const startColor = "rgb(50, 255, 50)";
    const endColor = "rgb(255, 20, 20)";
    const playerColor = "rgb(100, 255, 100)";

    
    context.fillStyle = startColor;
    context.fillRect(overlay_data[3] * cellPx + 1, overlay_data[2] * cellPx + 1, cellPx - 1, cellPx - 1);

    context.fillStyle = endColor;
    context.fillRect(overlay_data[5] * cellPx + 1, overlay_data[4] * cellPx + 1, cellPx - 1, cellPx - 1);

    context.fillStyle = playerColor;
    context.fillRect(overlay_data[1] * cellPx + 1, overlay_data[0] * cellPx + 1, cellPx - 1, cellPx - 1);


    context.strokeStyle = "black";

    console.log("generation good")

    let xDrawMin = overlay_data[0] - 30
    if (xDrawMin < 0){
        xDrawMin = 0
    }
    let xDrawMax = overlay_data[0] + 30
    if (xDrawMax > widthCell){
        xDrawMax = widthCell
    }
    let yDrawMin = overlay_data[1] - 30
    if (yDrawMin < 0){
        yDrawMin = 0
    }
    let yDrawMax = overlay_data[1] + 30
    if (yDrawMax > heightCell){
        yDrawMax = heightCell
    }
    
    context.fillStyle = "rgb(180, 180, 180)";
    context.fillRect(yDrawMin * cellPx, xDrawMin * cellPx, (yDrawMax - yDrawMin) * cellPx, (xDrawMax - xDrawMin) * cellPx);

    for (let x = xDrawMin; x < xDrawMax; x++){
        for (let y = yDrawMin; y < yDrawMax; y++){
        
            let cell = mazeState.maze.get_cell(x, y);

            //console.log(cell)
            let xTopLeftPx = x * cellPx + canvasOffset;
            let yTopLeftPx = y * cellPx + canvasOffset;
            if (cell[5]) { // Draw trail
                context.fillStyle = "rgb(255, 255, 0)";
                context.fillRect(yTopLeftPx, xTopLeftPx, cellPx, cellPx);
            }
            if (cell[0]) { // Draw top wall.
                context.beginPath();
                context.moveTo(yTopLeftPx, xTopLeftPx);
                context.lineTo(yTopLeftPx + cellPx, xTopLeftPx);
                context.stroke();
            }
            if (cell[1]) { // Draw right wall.
                context.beginPath();
                context.moveTo(yTopLeftPx + cellPx, xTopLeftPx + cellPx);
                context.lineTo(yTopLeftPx + cellPx, xTopLeftPx);
                context.stroke();
            }
            if (cell[2]) { // Draw bottom wall.
                context.beginPath();
                context.moveTo(yTopLeftPx + cellPx, xTopLeftPx + cellPx);
                context.lineTo(yTopLeftPx, xTopLeftPx + cellPx);
                context.stroke();
            }
            if (cell[3]) { // Draw left wall.
                context.beginPath();
                context.moveTo(yTopLeftPx, xTopLeftPx);
                context.lineTo(yTopLeftPx, xTopLeftPx + cellPx);
                context.stroke();
            }

            
        }
    }

    // Draw the start, end, and player.
    context.fillStyle = startColor;
    context.fillRect(overlay_data[3] * cellPx + 1, overlay_data[2] * cellPx + 1, cellPx - 1, cellPx - 1);

    context.fillStyle = endColor;
    context.fillRect(overlay_data[5] * cellPx + 1, overlay_data[4] * cellPx + 1, cellPx - 1, cellPx - 1);

    context.fillStyle = playerColor;
    context.fillRect(overlay_data[1] * cellPx + 1, overlay_data[0] * cellPx + 1, cellPx - 1, cellPx - 1);

}

function initDraw(mazeState){
    const canvasOffset = 1;

    // Get the canvas context to enable drawing on it.
    const canvas = document.getElementById("my-canvas");
    const context = canvas.getContext("2d");

    // Calculate the dimensions the generated maze needs.
    const cellPx = mazeState.maze.get_cell_size();
    const heightCell = mazeState.maze.get_grid_x();
    const widthCell = mazeState.maze.get_grid_y();

    // Set the canvas to the calculated dimensions.
    canvas.width  = cellPx * widthCell + 2;
    canvas.height = cellPx * heightCell + 2;
    
    context.fillStyle = "rgb(180, 180, 180)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.lineWidth = 1;
    context.strokeStyle = "black";
    
    let overlay_data = mazeState.maze.get_grid_overlay();



    for (let x = 0; x < heightCell; x++){
        for (let y = 0; y < widthCell; y++){
        
            let cell = mazeState.maze.get_cell(x, y);
            
            let xTopLeftPx = x * cellPx + canvasOffset;
            let yTopLeftPx = y * cellPx + canvasOffset;

            if (cell[0]) { // Draw top wall.
                context.beginPath();
                context.moveTo(yTopLeftPx, xTopLeftPx);
                context.lineTo(yTopLeftPx + cellPx, xTopLeftPx);
                context.stroke();
            }
            if (cell[1]) { // Draw right wall.
                context.beginPath();
                context.moveTo(yTopLeftPx + cellPx, xTopLeftPx + cellPx);
                context.lineTo(yTopLeftPx + cellPx, xTopLeftPx);
                context.stroke();
            }
            if (cell[2]) { // Draw bottom wall.
                context.beginPath();
                context.moveTo(yTopLeftPx + cellPx, xTopLeftPx + cellPx);
                context.lineTo(yTopLeftPx, xTopLeftPx + cellPx);
                context.stroke();
            }
            if (cell[3]) { // Draw left wall.
                context.beginPath();
                context.moveTo(yTopLeftPx, xTopLeftPx);
                context.lineTo(yTopLeftPx, xTopLeftPx + cellPx);
                context.stroke();
            }
        }
    }

    const startColor = "rgb(50, 255, 50)";
    const endColor = "rgb(255, 20, 20)";
    const playerColor = "rgb(100, 255, 100)";

    
    context.fillStyle = startColor;
    context.fillRect(overlay_data[3] * cellPx + 1, overlay_data[2] * cellPx + 1, cellPx - 1, cellPx - 1);

    context.fillStyle = endColor;
    context.fillRect(overlay_data[5] * cellPx + 1, overlay_data[4] * cellPx + 1, cellPx - 1, cellPx - 1);

    context.fillStyle = playerColor;
    context.fillRect(overlay_data[1] * cellPx + 1, overlay_data[0] * cellPx + 1, cellPx - 1, cellPx - 1);
}
function controlSetup(mazeState){
    document.addEventListener('keydown', event => {

        // Move player based on the key pressed.
        const key = event.key;
        console.log(key); //ArrowUp ArrowLeft ArrowRight ArrowDown
        if (key === "ArrowUp"){
            mazeState.maze.move_up();
        }
        if (key === "ArrowRight"){
            mazeState.maze.move_right();
        }
        if (key === "ArrowDown"){
            mazeState.maze.move_down();
        }
        if (key === "ArrowLeft"){
            mazeState.maze.move_left();
        }

        // Redraw the updated maze.
        draw(mazeState);

        console.log("finished")
        console.log(mazeState.maze.get_grid_overlay());
    });
}

function newMaze(lib){
    
    //Get the selected difficulty.
    var slider = document.getElementById("my-range");
    var difficulty = slider.value;
    
    // Get the hight of the divider.
    var div = document.getElementById("div");
    var divOffset = div.offsetHeight;

    // Get the inner pixel dimensions of the browser window.
    var windowWidth = window.innerWidth - 30;
    var windowHeight = window.innerHeight  - 30;
    
    // Find the useable dimensions for the canvas.
    var useWidth = windowWidth;
    var useHeight = windowHeight - divOffset;

    // Create and generate a new maze.
    const maze = new lib.Maze(useHeight - 2, useWidth - 2, difficulty);
    maze.generate_maze();

    console.log("done");

    return maze;
}

async function main(){

    const lib = await import("../pkg/index.js").catch(console.error);
    
    const maze = newMaze(lib);

    console.log(maze);

    var mazeState = {
        lib,
        maze: maze,
    };
    
    console.log(mazeState.maze);

    // Get reset button and attach event listener to it that recreates the page.
    var resetButton = document.getElementById("reset-button");
    resetButton.addEventListener("click", (event) => {
        mazeState.maze = newMaze(lib);

        // Show the maze and its overlay on the canvas.
        initDraw(mazeState);
    });

    // Enable controls for moving the player.
    controlSetup(mazeState);

    // Show the maze and its overlay on the canvas.
    initDraw(mazeState);
}

// create the page for the first time.
main();