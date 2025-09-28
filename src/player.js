import { COLORS, PLAYER_SPRITE } from "./config.js";

export function createPlayer(gridX, gridY, TILE) {  // players position in grid coords
  return {
    dir: 1, // 1 for right, -1 for left
    gx: gridX,  // grid coords
    gy: gridY,  // grid coords
    x: gridX * TILE,  // pixel coords
    y: gridY * TILE,  // pixel coords
    size: TILE,
  };
}


export function movePlayer(player, maze, dx, dy, TILE) {  // calculates target grid cell when player moves right/left
  const nextGx = player.gx + dx;
  const nextGy = player.gy + dy;

  if (dx > 0) player.dir = 1;  // updates facing direction if looking left or right
  if (dx < 0) player.dir = -1;

  if (  // checks boundaries and collision
    nextGx >= 0 &&
    nextGx < maze.w &&
    nextGy >= 0 &&
    nextGy < maze.h &&
    maze.grid[nextGy][nextGx] !== 1  // makes sure grid cell is not a wall
  ) {  // if valid, update positions
    player.gx = nextGx;
    player.gy = nextGy;
    player.x = player.gx * TILE;
    player.y = player.gy * TILE;
    return true; // move was successful
  }
  return false; // move failed
}


export function drawPlayer(ctx, player, TILE) {
    const img = getSprite();
    const x = Math.round(player.x);
    const y = Math.round(player.y);

    ctx.save();
    ctx.translate(x + TILE / 2, y + TILE / 2);
    ctx.scale(player.dir, 1);

    if (img && img.complete) {
        ctx.drawImage(img, -TILE / 2, -TILE / 2, TILE, TILE);
} else {
    ctx.fillStyle = COLORS.player;
    ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);
}
    ctx.restore();
}


function getSprite(){
    if (!window._playerImg) {
        const i = new Image();
        i.src = PLAYER_SPRITE; // sprite location
        window._playerImg = i;
    }
    return window._playerImg;
}