# Overview

This project requires you to have Rust, the tool wasm-pack, and NodeJS installed. Once those conditions are met you can use "npm start" to open and play the maze in your browser.

This is was a project meant to help me learn WebAssembly in Rust. It builds on my [Rust maze generator](https://github.com/KoAhauCaleb/maze-generator) project. I used JavaScript to show graphics and Rust to generate and keep the game state. By using Rust, large mazes can be generated with less of an impact on perfomance.

[Software Demo Video](https://youtu.be/DN9o5oDKg4s)

# Web Page

Contains a single webpage that:
* Let's you generate a maze based on your selected difficulty.
* View the solution for generated mazes.
* Use the arrow keys to navigate through the maze.

# Development Environment

Tools:
* Rust/Cargo - Manage Rust crates and version.
* wasm-pack - Tool for compileling Rust as WebAssembly. (cargo install wasm-pack)
* NodeJS - Run code from computer.

Crates:
* serde - Convert Rust types to something that JavaScript can understand.
* im:Vector - Alternative to native Vec, fixes issues when passing list to JavaScript objects.
* wasm_bindgen - Allow Rust funtions to be used in JavaScript.
* web_sys - Display messages in console from Rust.


# Useful Websites

* [Wasm Pack](https://rustwasm.github.io/docs/wasm-pack/quickstart.html)
* [Rust and WebAssembly](https://rustwasm.github.io/docs/book/introduction.html)
* [im Vector](https://docs.rs/im/15.0.0/im/struct.Vector.html)

# Future Work

* Improve graphics.
* Add win condition.
* Turn into actual site.