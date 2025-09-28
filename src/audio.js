
const sfx = {};
let globalVolume = 0.4;

function loadSfx(name, path) {
  const audio = new Audio(path);
  audio.volume = globalVolume;
  sfx[name] = audio;
}

export function initAudio() {
  loadSfx("tick", new URL("./assets/audios/tick.wav", import.meta.url).href);
  loadSfx("move", new URL("./assets/audios/move.wav", import.meta.url).href);
  loadSfx("bump", new URL("./assets/audios/bump.wav", import.meta.url).href);
  loadSfx("win", new URL("./assets/audios/win.wav", import.meta.url).href);
}

export function playSfx(name) {
  if (sfx[name]) {
    sfx[name].load();
    sfx[name].currentTime = 0;
    sfx[name].play().catch(e => {
      console.error(`Failed to play sound: ${name}`, e);
    });
  }
}

export function stopSfx(name) {
  if (sfx[name]) {
    sfx[name].pause();
    sfx[name].currentTime = 0;
  }
}

export function setVolume(volume) {
  globalVolume = volume;
  for (const sound in sfx) {
    sfx[sound].volume = globalVolume;
  }
}