var audio = require("../../audio.js");
var elements = require("../../gp2/elements.js");
var sounds = {};
var soundManager = {};
var noAudioMessage = elements.getGPId("noAudioMessage");

soundManager.engine = audio;

setInterval(() => {
  try {
    if (audio.running) {
      noAudioMessage.hidden = true;
    } else {
      noAudioMessage.hidden = false;
    }
  } catch (e) {
    window.alert(e);
  }
}, 1000 / 30);

soundManager.sounds = sounds;

soundManager.load = async function () {
  var a = await fetch("external/uisound.json");
  var soundURLS = await a.json();

  sounds.error = await audio.loadSoundFromURL(soundURLS.error);
  sounds.notify = await audio.loadSoundFromURL(soundURLS.notify);
  sounds.type = await audio.loadSoundFromURL(soundURLS.type);
  sounds.select = await audio.loadSoundFromURL(soundURLS.select);
};

soundManager.playingSounds = {};

soundManager.play = async function (sound, volume) {
  if (soundManager.playingSounds[sound]) {
    soundManager.playingSounds[sound].pause();
    soundManager.playingSounds[sound].destroy();
  }
  var aud = new audio.Player(soundManager.sounds[sound]);
  aud.play();
  if (typeof volume == "number") {
    aud.volume = volume;
  }
};

module.exports = soundManager;
