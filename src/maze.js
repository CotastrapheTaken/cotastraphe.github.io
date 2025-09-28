import { COLORS } from "./config.js";

// 0 = floor
// 1 = wall

export function createMazePrim(w, h, rng) {
  // Prims works best on odd sizes; adjust down if even
  if (w % 2 === 0) w -= 1;
  if (h % 2 === 0) h -= 1;
  w = Math.max(11, w);
  h = Math.max(11, h);

  const grid = Array.from({ length: h }, () => Array(w).fill(1)); // start all cells as walls (1)
  const start = { x: 1, y: 1 }; // ensures entrance is top left of the grid
  grid[start.y][start.x] = 0; // carves entrance

  const frontiers = [];
  addFrontiers(start.x, start.y);

  while (frontiers.length) {
    const idx = Math.floor(rng() * frontiers.length); // random frontier, choose a random frontier cell
    const { x, y } = frontiers.splice(idx, 1)[0];

    const carved = neighbors2(x, y, w, h).filter(n => grid[n.y][n.x] === 0);
    if (carved.length) {
      const n = carved[Math.floor(rng() * carved.length)];
      // knock down the wall between (x,y) and n (midpoint)
      const wx = Math.floor((x + n.x) / 2);
      const wy = Math.floor((y + n.y) / 2);
      grid[wy][wx] = 0;
      grid[y][x]   = 0;
      addFrontiers(x, y);
    }
  }

  const exit = { x: w - 2, y: h - 2 };
  grid[exit.y][exit.x] = 0; // make sure exit is open

  return { grid, w, h, start, exit };

  function addFrontiers(cx, cy) {
    for (const n of neighbors2(cx, cy, w, h)) {
      if (grid[n.y][n.x] === 1 && !frontiers.some(f => f.x === n.x && f.y === n.y)) {
        frontiers.push({ x: n.x, y: n.y });
      }
    }
    // only enable for debugging purposes; clutters console
    // console.debug("Frontiers:", frontiers);
  }
}

// colors
export function drawMaze(ctx, maze, TILE) {
  const { grid, w, h, start, exit } = maze;
  // floor
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 0, w * TILE, h * TILE);

  // draw grid lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.26)";
  ctx.lineWidth = 1;
  for (let y = 0; y < h; y++) {  // goes through each row
    for (let x = 0; x < w; x++) {  // goes through each column
      ctx.strokeRect(x * TILE, y * TILE, TILE, TILE);
  }
}
  // walls
  ctx.fillStyle = COLORS.wall;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x] === 1) ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
  }
  // start and exit marker colors
  ctx.fillStyle = COLORS.start;
  ctx.fillRect(start.x*TILE, start.y*TILE, TILE, TILE);
  ctx.fillStyle = COLORS.exit;
  ctx.fillRect(exit.x*TILE,  exit.y*TILE,  TILE, TILE);
}

export function isWall(maze, gx, gy) { // instead of pixel coordinates, grid coordinates
  const { grid, w, h } = maze;
  if (gx < 0 || gy < 0 || gx >= w || gy >= h) return true;
  return grid[gy][gx] === 1;
}

// distance to neighbors (skip one cell between)
function neighbors2(x, y, w, h) {  // prims algo only connects cells that are two appart (north/south/east/west)
  const out = [];
  if (x - 2 > 0)     out.push({ x: x - 2, y });
  if (x + 2 < w - 1) out.push({ x: x + 2, y });
  if (y - 2 > 0)     out.push({ x, y: y - 2 });
  if (y + 2 < h - 1) out.push({ x, y: y + 2 });
  return out;
}