use wasm_bindgen::prelude::*;
use web_sys::console;
use rand::Rng;
use im::Vector;
use std::iter::FromIterator;
use serde::{Serialize, Deserialize};



// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

const REF_COORD: [[isize; 2]; 4] = [[-1, 0], [0, 1], [1, 0], [0, -1]];

#[wasm_bindgen]
#[derive(Clone)]
struct Maze{
    pixel_x: usize,
    pixel_y: usize,
    cell_size: usize,
    grid_size_x: usize,
    grid_size_y: usize,
    grid: Vector<Vector<[bool; 6]>>,
    game_overlay: GameOverlay,
}

#[wasm_bindgen]
impl Maze{
    #[wasm_bindgen(constructor)]
    pub fn new(pixel_x: usize, pixel_y: usize, difficulty: f32) -> Maze{
        
        //TODO: Fine tune the pixel and dificulty
        //Find the how many cells should fit on grid based on difficulty.
        let grid_size_y = (difficulty * 3.0) as usize;

        //Figure out what cell pixel dimensions should be.
        let cell_size = pixel_x / grid_size_y;
        
        Maze {
            pixel_x: pixel_x,
            pixel_y: pixel_y,
            cell_size: cell_size,
            grid_size_x: pixel_x / cell_size,
            grid_size_y: pixel_y / cell_size,
            grid: Vector::new(),
            game_overlay: GameOverlay::empty(),
        }
    }

    // Get the players x position as usize.
    pub fn get_player_x(&self) -> usize{
        self.game_overlay.player_x
    }

    // Get the players y position as usize.
    pub fn get_player_y(&self) -> usize{
        self.game_overlay.player_y
    }

    // Get array of cells values at position (x,y).
    pub fn get_cell(&self, x: usize, y: usize) -> JsValue{
        let cell = self.game_overlay.grid[x][y];

        JsValue::from_serde(&cell).unwrap()
    }

    // Get start, end, and player positions as array.
    pub fn get_grid_overlay(&mut self) -> JsValue{
        let cell_overlay = self.game_overlay.get_overlay_data();

        JsValue::from_serde(&cell_overlay).unwrap()
    }

    // Get the pixel dimensions that will allow maze to fit on screen.
    pub fn get_cell_size(&self) -> usize{
        self.cell_size
    }

    // Get the height of maze in cells.
    pub fn get_grid_x(&self) -> usize{
        self.grid_size_x
    }

    // Get the width of maze in cells.
    pub fn get_grid_y(&self) -> usize{
        self.grid_size_y
    }

    // Functions used to move player, movement done in overlay.
    pub fn move_up(&mut self){
        self.game_overlay.move_up();
    }
    pub fn move_right(&mut self){
        self.game_overlay.move_right();
    }
    pub fn move_down(&mut self){
        self.game_overlay.move_down();
    }
    pub fn move_left(&mut self){
        self.game_overlay.move_left();
    }


    pub fn generate_maze(&mut self){

        //Create an 2d vector filled with maze cells with no connections.
        self.create_empty_grid();
        
        //Generate first path in maze.
        self.rdf(0, 0, 0);

        //Recursively generate maze, without exceeding stack size.
        for x in 0..self.grid_size_x {
            for y in 0..self.grid_size_y {
                // If the cell has been visited, but has unvisted cell next to
                // it start a new path at that spot.
                if self.grid[x][y][4] && self.count_adj_unvisited(x, y)[4]{
                    self.rdf(x, y, 0);
                }
            }
        };
        
        //After the maze has been generated, start create an overlay for it.
        self.game_overlay = GameOverlay::new(self.grid_size_x, self.grid_size_y, self.grid.clone())
    }
    
    // Uses the recursive randomized depth first algorithm to generate maze.
    pub fn rdf(&mut self, cell_x: usize, cell_y: usize, sack_size: usize) -> bool{
        
        //Find the cell next to the current one that are unvisited.
        let mut adj_unvisited = self.count_adj_unvisited(cell_x, cell_y);
        
        //Set this cell to visited.
        self.grid[cell_x][cell_y][4] = true;
        
        let mut canceled = false;

        //Keep doing while there is no cells around this one, or stack size is full.
        while adj_unvisited[4]  && !canceled {

            //Randomly select a surrounding cell.
            let mut selected_cell: usize = rand::thread_rng().gen_range(0..4);
            
            //Check if that cell was visited and keep randomly selecting an
            //unvisited cell is found.
            while adj_unvisited[selected_cell] {
                selected_cell = rand::thread_rng().gen_range(0..4);
            }
    
            //Get coords of next cell.
            let cell_x: isize = cell_x as isize;
            let cell_y: isize = cell_y as isize;
            let next_cell_x: usize = (cell_x + REF_COORD[selected_cell][0]) as usize;
            let next_cell_y: usize = (cell_y + REF_COORD[selected_cell][1]) as usize;
    
            //Open walls based on selection.
            {
                let cell_x: usize = cell_x as usize;
                let cell_y: usize = cell_y as usize;
                let next_cell_x: usize = next_cell_x as usize;
                let next_cell_y: usize = next_cell_y as usize;
                
                //Open wall in this cell.
                self.grid[cell_x][cell_y][selected_cell] = false;
                
                //Open wall in next cell.
                let next_selected_wall = (selected_cell + 2) % 4;
                self.grid[next_cell_x][next_cell_y][next_selected_wall] = false;
            }
    
            //Call rdf on next cell
            canceled = self.rdf(next_cell_x, next_cell_y, sack_size + 1);
    
            //Check if cell still has placed next to it that are still unvisited.
            let cell_x: usize = cell_x as usize;
            let cell_y: usize = cell_y as usize;
            adj_unvisited = self.count_adj_unvisited(cell_x, cell_y);
            
            // End generation of path when stack size gets to large.
            if sack_size > 500 {
                canceled = true;
            }

        }

        canceled
    }
    
    fn count_adj_unvisited(&mut self, cell_x: usize, cell_y: usize) -> [bool; 5] {
        
        //Start out by saying there are no adjacent unavailable spaces.
        let mut adj_unvisited = false;
    
        //Set the default of each surrounding cell to visited.
        let (mut cell_up, mut cell_right, mut cell_down, mut cell_left) 
            = (true, true, true, true);
    
        //The next if statements work similarly.
        //Check cell up.
        if cell_x > 0 {
            if self.grid[cell_x - 1][cell_y][4] == false{
                
                //If the cell is unvisited then there are adjacent unvisited cells
                //and this cell is has not been visited.
                adj_unvisited = true;
                cell_up = false;
            }
        }
        //Check cell right.
        if (cell_y + 1) < self.grid[1].len() {
            if self.grid[cell_x][cell_y + 1][4] == false{
                adj_unvisited = true;
                cell_right = false;
            }
        }
        //Check cell down.
        if (cell_x + 1) < self.grid.len() {
            if self.grid[cell_x + 1][cell_y][4] == false{
                adj_unvisited = true;
                cell_down = false;
            }
        }
        //Check cell left.
        if cell_y > 0 {
            if self.grid[cell_x][cell_y - 1][4] == false{
                adj_unvisited = true;
                cell_left = false;
            }
        }
    
        //Return all 5 booleans found.
        [cell_up, cell_right, cell_down, cell_left, adj_unvisited]
    }

    ///Creates an empty grid of maze cells. The 
    fn create_empty_grid(&mut self){

        //Calculate grid size based on difficulty
        let grid_size_x = self.grid_size_x;
        let grid_size_y = self.grid_size_y;

        //Create 2 dimensional vector holding arrays to represent grid,
        //arrays represent where opening in each
        //cell is at and if the the cell has been visited.
        // let mut grid: Vector<Vector<[bool; 5]>> = Vector::new(); TODO: Redundant, in contructor.

        //Create the grid.
        for _row in 0..grid_size_x {
            let mut row_vec: Vector<[bool; 6]> = Vector::new();
            for _column in 0..grid_size_y {
                //0: top wall; 1: right wall; 2: bottom wall; 3: left wall; 4: visited, 5: trail
                row_vec.push_back([true, true, true, true, false, false]); 
            }
            self.grid.push_back(row_vec)
        };
    }
}

#[derive(Clone)]
struct GameOverlay{
    player_x: usize,
    player_y: usize,
    grid_size_x: usize,
    grid_size_y: usize,
    start_x: usize,
    start_y: usize,
    end_x: usize,
    end_y: usize,
    grid: Vector<Vector<[bool; 6]>>,
}

impl GameOverlay{

    pub fn empty() -> GameOverlay{
        
        GameOverlay{
            player_x: 0,
            player_y: 0,
            grid_size_x: 0,
            grid_size_y: 0,
            start_x: 0,
            start_y: 0,
            end_x: 0,
            end_y: 0,
            grid: Vector::new()
        }
    }

    pub fn new(grid_size_x: usize, grid_size_y: usize, grid: Vector<Vector<[bool; 6]>>) -> GameOverlay{
        GameOverlay{
            player_x: 0,
            player_y: 0,
            grid_size_x: grid_size_x,
            grid_size_y: grid_size_y,
            start_x: 0,
            start_y: 0,
            end_x: grid_size_x,
            end_y: grid_size_y,
            grid: grid
        }
    }

    pub fn get_player_x(&self) -> usize{
        self.player_x
    }

    pub fn get_player_y(&self) -> usize{
        self.player_y
    }
  
    pub fn add_trail(&mut self, x: usize , y: usize ){
        if !self.grid[x][y][5]{
            self.grid[x][y][5] = true;
        }
        else {
            self.grid[x][y][5] = false;
        }
    }

    pub fn end_trail_check(&mut self, x: usize , y: usize, sx: usize , sy: usize){
        // Check to make sure trail has been updated correctly at end of move,
        // Correct if it has not been.
        if self.grid[x][y][5]{
            self.grid[sx][sy][5] = false;
        }
        else {
            self.grid[sx][sy][5] = true;
        }
    }
    

    fn cell_opening_count(&self, cell_data: [bool; 6]) -> usize{
        let mut count = 0;
        for wall in 0..4 {
            if cell_data[wall] == false{
                count += 1
            }
        }
        let outstring = format!("Count: {}", count);
        console::log_1(&JsValue::from_str(&outstring));
        count
    }
    
    pub fn move_up(&mut self){
        //self.trail.clear();
        //self.add_trail(self.player_x, self.player_y);
        let start_x = self.player_x;
        let start_y = self.player_y;

        let mut player_pos = self.grid[self.player_x][self.player_y];
        if (player_pos[0] == false){
            self.add_trail(self.player_x, self.player_y);
            self.player_x -= 1;
            player_pos = self.grid[self.player_x][self.player_y];
            
        }
        while (player_pos[0] == false) && (self.cell_opening_count(player_pos) <= 2){
            self.add_trail(self.player_x, self.player_y);
            self.player_x -= 1;
            player_pos = self.grid[self.player_x][self.player_y];
            
        }
        self.end_trail_check(self.player_x, self.player_y, start_x, start_y);
    }
    pub fn move_right(&mut self){
        //self.trail.clear();
        //self.add_trail(self.player_x, self.player_y);
        let start_x = self.player_x;
        let start_y = self.player_y;


        let mut player_pos = self.grid[self.player_x][self.player_y];
        if (player_pos[1] == false){
            self.add_trail(self.player_x, self.player_y);
            self.player_y += 1;
            player_pos = self.grid[self.player_x][self.player_y];
            
        }
        while (player_pos[1] == false) && (self.cell_opening_count(player_pos) <= 2){
            self.add_trail(self.player_x, self.player_y);
            self.player_y += 1;
            player_pos = self.grid[self.player_x][self.player_y];
            
        }
        self.end_trail_check(self.player_x, self.player_y, start_x, start_y);
    }
    pub fn move_down(&mut self){
        //self.trail.clear();
        //self.add_trail(self.player_x, self.player_y);
        let start_x = self.player_x;
        let start_y = self.player_y;

        let mut player_pos = self.grid[self.player_x][self.player_y];
        if (player_pos[2] == false){
            self.add_trail(self.player_x, self.player_y);
            self.player_x += 1;
            player_pos = self.grid[self.player_x][self.player_y];
            
        }
        while (player_pos[2] == false) && (self.cell_opening_count(player_pos) <= 2){
            self.add_trail(self.player_x, self.player_y);
            self.player_x += 1;
            player_pos = self.grid[self.player_x][self.player_y];
            
        }
        self.end_trail_check(self.player_x, self.player_y, start_x, start_y);
    }
    pub fn move_left(&mut self){
        //self.trail.clear();
        //self.add_trail(self.player_x, self.player_y);
        let start_x = self.player_x;
        let start_y = self.player_y;

        let mut player_pos = self.grid[self.player_x][self.player_y];
        if (player_pos[3] == false){
            self.add_trail(self.player_x, self.player_y);
            self.player_y -= 1;
            player_pos = self.grid[self.player_x][self.player_y];
            
        }
        while (player_pos[3] == false) && self.cell_opening_count(player_pos) <= 2{
            self.add_trail(self.player_x, self.player_y);
            self.player_y -= 1;
            player_pos = self.grid[self.player_x][self.player_y];
            
        }
        self.end_trail_check(self.player_x, self.player_y, start_x, start_y);
    }

    pub fn get_overlay_data(&mut self) -> [usize; 6]{
        [
            self.player_x,
            self.player_y,
            self.start_x,
            self.start_y,
            self.end_x - 1,
            self.end_y - 1,
        ]
    }
}