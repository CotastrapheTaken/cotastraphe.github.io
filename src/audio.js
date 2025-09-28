
import tickSfx from './assets/audios/tick.wav';
import moveSfx from './assets/audios/move.wav';
import bumpSfx from './assets/audios/bump.wav';
import winSfx from './assets/audios/win.wav';

const sfx = {};
let globalVolume = 0.4;

function loadSfx(name, path) {
  const audio = new Audio(path);
  audio.volume = globalVolume;
  sfx[name] = audio;
}

export function initAudio() {
  loadSfx("tick", tickSfx);
  loadSfx("move", moveSfx);
  loadSfx("bump", bumpSfx);
  loadSfx("win", winSfx);
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