import { drawHUD, banner } from "./hud.js";
import { createMazePrim, drawMaze } from "./maze.js";
import { createPlayer, movePlayer, drawPlayer } from "./player.js";
import { createTimer } from "./timer.js";
import { initAudio, playSfx, setVolume, stopSfx } from "./audio.js";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from "./config.js";

// canvas and constants
const canvas = document.getElementById("app");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// init audio
initAudio();

// menu elements
const mainMenu = document.getElementById("main-menu");
const playBtn = document.getElementById("play-btn");
const settingsBtn = document.getElementById("settings-btn");
const exitBtn = document.getElementById("exit-btn");
const settingsMenu = document.getElementById("settings-menu");
const movementToggleBtn = document.getElementById("movement-toggle-btn");
const volumeSlider = document.getElementById("volume-slider");
const volumeLabel = document.getElementById("volume-label");
const backBtn = document.getElementById('back-btn');
const tutorialEl = document.getElementById('tutorial');
const gameInfoEl = document.getElementById('game-info');

// game constants
const INITIAL_TILE_SIZE = 32;
const INITIAL_TIME_LIMIT = 60; // seconds
const TIME_DECREMENT_PER_LEVEL = 5; // seconds
const TILE_DECREMENT_PER_LEVEL = 2; // pixels

// game settings
let movementType = "autorun"; // manual | autorun

// game state
let maze, player, timer, seedStr, rng;
let gameStarted = false;
let currentLevel = 1;
let TILE_SIZE = INITIAL_TILE_SIZE;
let TIME_LIMIT = INITIAL_TIME_LIMIT;
let gameState = "MENU"; // Initialize gameState to MENU

// autorun movement state
const STEP_INTERVAL = 150; // ms per tile
let lastStepTime = 0;
let desiredDir = { dx: 0, dy: 0 };
let currentDir = { dx: 0, dy: 0 };

// loop
let last;

// level progression and difficulty
function init(seed, isNewLevel = false) {
  if (isNewLevel) {
    currentLevel++;
    TILE_SIZE = Math.max(8, INITIAL_TILE_SIZE - (currentLevel - 1) * TILE_DECREMENT_PER_LEVEL);
    TIME_LIMIT = Math.max(10, INITIAL_TIME_LIMIT - (currentLevel - 1) * TIME_DECREMENT_PER_LEVEL);
  } else {
    currentLevel = 1;
    TILE_SIZE = INITIAL_TILE_SIZE;
    TIME_LIMIT = INITIAL_TIME_LIMIT;
  }

  seedStr = seed ?? Date.now().toString();
  rng = new seedrandom(seedStr);

  const GRID_W = Math.floor(CANVAS_WIDTH / TILE_SIZE);
  const GRID_H = Math.floor(CANVAS_HEIGHT / TILE_SIZE);

  maze = createMazePrim(GRID_W, GRID_H, rng);
  player = createPlayer(maze.start.x, maze.start.y, TILE_SIZE);
  gameState = "RUNNING";
  if (timer) timer.stop();
  timer = createTimer(TIME_LIMIT, () => playSfx("tick"));
  gameStarted = false;

  // reset autorun state
  lastStepTime = 0;
  desiredDir = { dx: 0, dy: 0 };
  currentDir = { dx: 0, dy: 0 };

  console.log("Game started, seed:", seedStr, "Level:", currentLevel, "Tile Size:", TILE_SIZE, "Time Limit:", TIME_LIMIT);

  // update URL without reloading webpage
  const url = new URL(location);
  url.searchParams.set("seed", seedStr);
  history.pushState({}, "", url);

  last = performance.now(); // reset last time for the loop
}

// menu logic
playBtn.addEventListener("click", () => {
  mainMenu.style.display = "none";
  app.style.display = "block";
  tutorialEl.style.display = "block"; // tutorial when game starts
  gameInfoEl.style.display = "block";
  const params = new URLSearchParams(location.search);
  init(params.get("seed"));
  // call requestAnimationFrame(loop) once to start the loop
  if (gameState === "RUNNING") {
    requestAnimationFrame(loop);
  }
});

settingsBtn.addEventListener("click", () => {
  mainMenu.style.display = "none";
  settingsMenu.style.display = "block";
});

exitBtn.addEventListener("click", () => {
  window.close();
});

movementToggleBtn.addEventListener("click", () => {
  if (movementType === "manual") {
    movementType = "autorun";
    movementToggleBtn.textContent = "Movement: Auto-run";
  } else {
    movementType = "manual";
    movementToggleBtn.textContent = "Movement: Manual";
  }
});

volumeSlider.addEventListener("input", (e) => {
  const volume = e.target.value;
  setVolume(volume);
  volumeLabel.textContent = `${Math.round(volume * 100)}%`;
});

backBtn.addEventListener("click", () => {
  settingsMenu.style.display = "none";
  mainMenu.style.display = "block";
});

// input
addEventListener("keydown", (e) => {
  // Global restart
  if (e.code === "KeyR") {
    restart();
    return;
  }
  if (e.code === "KeyM") {
    showMainMenu();
    return;
  }

  // after game over
  if (gameState === "WON" || gameState === "LOST") {
    if (e.code === "Enter") {
      console.debug("restarting")
      if (gameState === "WON") {
        init(null, true); // start new level with new seed
      } else {
        restart();
      }
    } else if (e.code === "KeyM") {
      console.debug("Returning to main menu");
      showMainMenu();
    }
    return;
  }

  // during game inputs
  if (gameState === "RUNNING") {
    let dx = 0,
      dy = 0;
    if (e.code === "ArrowUp" || e.code === "KeyW") dy = -1;
    if (e.code === "ArrowDown" || e.code === "KeyS") dy = 1;
    if (e.code === "ArrowLeft" || e.code === "KeyA") dx = -1;
    if (e.code === "ArrowRight" || e.code === "KeyD") dx = 1;

    if (dx !== 0 || dy !== 0) {
      if (!gameStarted) {
        timer.start();
        gameStarted = true;
      }

      if (movementType === "manual") {
        if (movePlayer(player, maze, dx, dy, TILE_SIZE)) {
          playSfx("move");
        } else {
          playSfx("bump");
        }
      } else if (movementType === "autorun") {
        desiredDir = { dx, dy };
        // move on first input
        if (currentDir.dx === 0 && currentDir.dy === 0) {
          currentDir = { ...desiredDir };
        }
      }
    }
  }
});

// loop
function attemptMove(dx, dy) {
    if (movePlayer(player, maze, dx, dy, TILE_SIZE)) {
        playSfx("move");
    } else {
        playSfx("bump");
    }
}

function loop(t) {
  if (last === undefined) last = t;
  const dt = (t - last) / 1000;
  last = t;

  // update
  if (gameState === "RUNNING") {
    if (movementType === "autorun" && (currentDir.dx !== 0 || currentDir.dy !== 0)) {
      if (t - lastStepTime > STEP_INTERVAL) {
        lastStepTime = t;

        const { gx, gy } = player;
        let nextDir = { ...currentDir };

        const canTurn = canMove(maze, gx, gy, desiredDir.dx, desiredDir.dy);
        if (canTurn && (desiredDir.dx !== currentDir.dx || desiredDir.dy !== currentDir.dy)) {
          nextDir = { ...desiredDir };
        }
        else if (!canMove(maze, gx, gy, currentDir.dx, currentDir.dy)) {
          nextDir = { dx: 0, dy: 0 }; // stp if cant move straigt
        }

        currentDir = { ...nextDir };
        if (currentDir.dx !== 0 || currentDir.dy !== 0) {
            attemptMove(currentDir.dx, currentDir.dy);
        } else {
            playSfx("bump");
        }
      }
    }

    // win/loss conditions
    const gx = Math.floor(player.x / TILE_SIZE);
    const gy = Math.floor(player.y / TILE_SIZE);
    if (gx === maze.exit.x && gy === maze.exit.y) {
      gameState = "WON";
      playSfx("win");
      console.debug("playsfx win");
      timer.stop();
      console.log("Game state: WON");
    } else {
      timer.update(dt);
      if (timer.remaining() <= 0) {
        gameState = "LOST";
        timer.stop();
        console.log("Game state: LOST");
      }
    }
  }

  // render
  if (gameState !== "MENU") { // draw maze and player if not in menu
    drawMaze(ctx, maze, TILE_SIZE);
    drawPlayer(ctx, player, TILE_SIZE);
    drawHUD(ctx, timer.remaining());
    gameInfoEl.innerText = `SEED=${seedStr} LEVEL=${currentLevel}`;
  }


  if (gameState === "WON")
    banner(ctx, "YOU WIN — ENTER TO NEXT LEVEL | M FOR MENU");
  if (gameState === "LOST")
    banner(ctx, "TIME OUT — ENTER TO RESTART | M FOR MENU");

  if (gameState !== "MENU") {
    requestAnimationFrame(loop);
  }
}

// maze init logging
// console.log("Grid size:", GRID_W, "x", GRID_H, "cells");
// console.log("Grid total:", GRID_W * GRID_H, "cells");
// console.log("Maze size:", maze.w, "x", maze.h, "cells");
// console.log("Maze total:", maze.w * maze.h, "cells");

function canMove(maze, gx, gy, dx, dy) {
  const nextGx = gx + dx;
  const nextGy = gy + dy;
  return (
    nextGx >= 0 &&
    nextGx < maze.w &&
    nextGy >= 0 &&
    nextGy < maze.h &&
    maze.grid[nextGy][nextGx] !== 1
  );
}

// restart function
function restart(sameSeed = false) {
  console.log("Restarting game");
  const newSeed = sameSeed ? seedStr : Date.now().toString();
  init(newSeed);
}

function showMainMenu() {
  mainMenu.style.display = 'block';
  settingsMenu.style.display = 'none';
  app.style.display = 'none';
  tutorialEl.style.display = 'none';
  gameInfoEl.style.display = 'none';
  gameStarted = false;
  stopSfx('win');
  canvas.style.display = "none";
  gameState = "MENU";
  if (timer) timer.stop();
  console.log("Returning to main menu");
}