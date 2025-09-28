import { movePlayer } from "./player.js";
import { playSfx } from "./audio.js";

const STEP_INTERVAL = 150; // ms per tile
let lastStepTime = 0;
let desiredDir = { dx: 0, dy: 0 };
let currentDir = { dx: 0, dy: 0 };
let movementType = "autorun"; // manual | autorun

export function initMovement() {
    lastStepTime = 0;
    desiredDir = { dx: 0, dy: 0 };
    currentDir = { dx: 0, dy: 0 };
}

export function setMovementType(type) {
    movementType = type;
    const movementToggleBtn = document.getElementById("movement-toggle-btn");
    if (type === "manual") {
        movementToggleBtn.textContent = "Movement: Manual";
    } else {
        movementToggleBtn.textContent = "Movement: Auto-run";
    }
}

export function getMovementType() {
    return movementType;
}

export function handleKeydown(e, gameState, player, maze, TILE_SIZE, timer, gameStarted) {
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
            // Start moving on first input
            if (currentDir.dx === 0 && currentDir.dy === 0) {
                currentDir = { ...desiredDir };
            }
        }
    }
    return gameStarted;
}

export function updateAutorun(t, player, maze, TILE_SIZE) {
    if (movementType === "autorun" && (currentDir.dx !== 0 || currentDir.dy !== 0)) {
        if (t - lastStepTime > STEP_INTERVAL) {
            lastStepTime = t;

            const { gx, gy } = player;

            // Try to turn to desired direction
            const canTurn = canMove(maze, gx, gy, desiredDir.dx, desiredDir.dy);
            if (canTurn && (desiredDir.dx !== currentDir.dx || desiredDir.dy !== currentDir.dy)) {
                currentDir = { ...desiredDir };
                if (movePlayer(player, maze, currentDir.dx, currentDir.dy, TILE_SIZE)) {
                    playSfx("move");
                } else {
                    playSfx("bump");
                }
            }
            // Otherwise, keep going straight
            else if (canMove(maze, gx, gy, currentDir.dx, currentDir.dy)) {
                if (movePlayer(player, maze, currentDir.dx, current-Dir.dy, TILE_SIZE)) {
                    playSfx("move");
                } else {
                    playSfx("bump");
                }
            }
            // Otherwise, stop
            else {
                currentDir = { dx: 0, dy: 0 };
                playSfx("bump");
            }
        }
    }
}

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