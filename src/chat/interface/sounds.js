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

  var soundsToLoad = ["error", "notify", "type", "select"];

  for (var soundName of soundsToLoad) {
    var data;
    data = await audio.loadSoundFromURL(soundURLS[soundName]);
    //loadSoundFromURL may fail and return null without throwing errors.
    //although no errors would be thrown trying to play null, it would lead to unexpected bugs
    if (!data) {
      data = await audio.loadSoundFromURL(soundURLS[soundName + "Backup"]);
    }
    if (!data) {
      console.warn(
        `❌ UI sound "${soundName}" failed to load from both primary and backup.`,
      );
    }
    sounds[soundName] = data;
  }
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
