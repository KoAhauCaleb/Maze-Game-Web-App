
function draw(maze){

    // Offset used so that the maze boarders show clearly around the maze.
    const canvasOffset = 1;

    // Get the canvas context to enable drawing on it.
    const canvas = document.getElementById("my-canvas");
    const context = canvas.getContext("2d");

    
    context.strokeStyle = "rgb(50, 50, 50)";
    context.fillStyle = "rgb(180, 180, 180)";
    context.lineWidth = 1;

    context.fillRect(0, 0, canvas.width, canvas.height);

    const cellPx = maze.get_cell_size();
    const heightCell = maze.get_grid_y();
    const widthCell = maze.get_grid_x();

    let overlay_data = maze.get_grid_overlay();
    
    const startColor = "rgb(50, 255, 50)"
    const endColor = "rgb(255, 20, 20)"
    const playerColor = "rgb(100, 255, 100)"

    
    context.fillStyle = startColor;
    context.fillRect(overlay_data[3] * cellPx + 1, overlay_data[2] * cellPx + 1, cellPx - 1, cellPx - 1);

    context.fillStyle = endColor;
    context.fillRect(overlay_data[5] * cellPx + 1, overlay_data[4] * cellPx + 1, cellPx - 1, cellPx - 1);

    context.fillStyle = playerColor;
    context.fillRect(overlay_data[1] * cellPx + 1, overlay_data[0] * cellPx + 1, cellPx - 1, cellPx - 1);


    context.strokeStyle = "black";

    console.log("generation good")

    for (let x = 0; x < widthCell; x++){
        for (let y = 0; y < heightCell; y++){
        
            let cell = maze.get_cell(x, y);

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
    

function controlSetup(maze){
    document.addEventListener('keydown', event => {

        // Move player based on the key pressed.
        const key = event.key;
        console.log(key); //ArrowUp ArrowLeft ArrowRight ArrowDown
        if (key === "ArrowUp"){
            maze.move_up();
        }
        if (key === "ArrowRight"){
            maze.move_right();
        }
        if (key === "ArrowDown"){
            maze.move_down();
        }
        if (key === "ArrowLeft"){
            maze.move_left();
        }

        // Redraw the updated maze.
        draw(maze);

        console.log("finished")
        console.log(maze.get_grid_overlay());
    });
}

async function main(){
    // Import lib.rs which is compiled as WebAssembly.
    const lib = await import("../pkg/index.js").catch(console.error);

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
    let maze = new lib.Maze(useHeight - 2, useWidth - 2, difficulty);
    maze.generate_maze();

    // Calculate the dimensions the generated maze needs.
    const cellPx = maze.get_cell_size();
    const heightCell = maze.get_grid_x();
    const widthCell = maze.get_grid_y();

    // Set the canvas to the calculated dimensions.
    const canvas = document.getElementById("my-canvas");
    canvas.width  = cellPx * widthCell + 2;
    canvas.height = cellPx * heightCell + 2;

    // Enable controls for moving the player.
    controlSetup(maze);

    console.log(maze.get_player_x);
    console.log(maze.get_player_y);

    // Show the maze and its overlay on the canvas.
    draw(maze);

    console.log("done");
}

// Get reset button and attach event listener to it that recreates the page.
var resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", event => {
    main()
});

// create the page for the first time.
main()