export function createTimer(seconds, onTick){
    let t = seconds, running = false;
    let lastT = seconds;
    return {
        start(){ running = true; },
        stop(){ running = false; },
        pause(){ running = false; },
        resume(){ running = true; },
        update(dt) {
            if (running) {
                t = Math.max(0, t - dt);
                if (Math.floor(lastT) !== Math.floor(t)) {
                    onTick?.();
                }
                lastT = t;
            }
        },
        remaining() { return t; },
        max: seconds
    };
}