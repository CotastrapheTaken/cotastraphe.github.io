import { COLORS, } from "./config.js";

export function drawHUD(ctx, t) {
    const s = Math.ceil(t);
    const mm = String(Math.floor(s/60)).padStart(2,"0");
    const ss = String(s%60).padStart(2,"0");
    ctx.fillStyle = s <= 10 ? "#ff5252" : COLORS.hud;
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillText(`${mm}:${ss}`, 12, 24);
}


export function banner(ctx, text) {
    ctx.save();
    ctx.fillStyle = "#000a"
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.fillStyle = "#fff"; ctx.font = "28px 'Press Start 2P'";
    const w = ctx.measureText(text).width;
    ctx.fillText(text, (ctx.canvas.width-w)/2, ctx.canvas.height/2);
    ctx.restore();
}