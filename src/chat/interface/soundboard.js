var elements = require("../../gp2/elements.js");
var accountHelper = require("../../accounthelper");
var dialog = require("../../dialogs.js");
var currentRoom = require("./getroom.js");
var fetchUtils = require("./fetchutils.js");
var sb = {};
var audioEngine = require("../../audio.js");

var loadedSounds = [];
sb.loadedSounds = loadedSounds;

var validState = accountHelper.getCurrentValidationState();

var soundboardVolume = 100;
var soundboardMutliplier = 0;
var soundboardMultipliers = [
  {
    label: "1x",
    mult: 1,
  },
  {
    label: "2x",
    mult: 2,
  },
  {
    label: "5x",
    mult: 5,
  },
  {
    label: "10x",
    mult: 10,
  },
  {
    label: "15x",
    mult: 15,
  },
  {
    label: "20x",
    mult: 20,
  },
  {
    label: "50x",
    mult: 50,
  },
  {
    label: "100x",
    mult: 100,
  },
];
var playingSounds = [];

if (localStorage.getItem("soundboardVolume")) {
  soundboardVolume = Number(localStorage.getItem("soundboardVolume"));
}

var dialogDiv = document.createElement("div");
var dom = elements.createElementsFromJSON([
  //Background
  {
    element: "div",
    className: "dialogBackground",
  },
  //Dialog box
  {
    element: "div",
    className: "soundboardDialog popupDialogAnimation",
    children: [
      {
        element: "div",
        style: {
          width: "100%",
          height: "100%",
        },
        className: "centerHorizontal",
        children: [
          {
            element: "br",
          },
          {
            element: "span",
            style: {
              fontWeight: "bold",
              fontSize: "30px",
            },
            textContent: "🔊 Chaos Soundboard 🔥",
          },
          {
            element: "br",
          },
          {
            element: "span",
            textContent:
              "Play sounds for the whole room. No regrets. No refunds.",
          },
          {
            element: "br",
          },
          {
            element: "button",
            gid: "soundboardMuteButton",
            GPWhenCreated: function (elm) {
              //Load soundboard volume state.
              if (localStorage.getItem("soundboardUnmuteState") == "N") { //Use off (The value N) so that if no value is set then it defaults to on.
                soundboardVolume = 0;
              } else {
                soundboardVolume = 100;
              }

              //Update text.
              if (soundboardVolume == 0) {
                elm.textContent = "Unmute";
              } else {
                elm.textContent = "Mute";
              }
            },
            eventListeners: [
              {
                event: "click",
                func: function () {
                  //Unmute or mute.
                  if (soundboardVolume == 100) {
                    soundboardVolume = 0;
                    localStorage.setItem("soundboardUnmuteState", "N");
                  } else {
                    soundboardVolume = 100;
                    localStorage.setItem("soundboardUnmuteState", "Y");
                  }

                  //Update text
                  if (soundboardVolume == 0) {
                    this.textContent = "Unmute";
                  } else {
                    this.textContent = "Mute";
                  }
                },
              },
            ],
          },
          {
            element: "br",
          },
          {
            element: "span",
            textContent: "Soundboard Boost:",
          },
          {
            element: "button",
            className: "roundborder",
            title: "Click to make it louder (and probably regret it)",
            textContent: soundboardMultipliers[soundboardMutliplier].label,
            eventListeners: [
              {
                event: "click",
                func: function () {
                  soundboardMutliplier += 1;
                  if (soundboardMutliplier > soundboardMultipliers.length - 1) {
                    soundboardMutliplier = 0;
                  }
                  this.textContent =
                    soundboardMultipliers[soundboardMutliplier].label;
                },
              },
            ],
          },
          { element: "br" },
          {
            element: "button",
            className: "roundborder",
            eventListeners: [
              {
                event: "click",
                func: function () {
                  dialogDiv.hidden = true;
                },
              },
            ],
            textContent: "Close",
          },
          { element: "hr" },
          {
            element: "div",
            className: "soundboardButtons",
            gid: "soundboardButtonsContainer",
            children: [
              {
                element: "div",
                className: "soundboardButtonStop",
                children: [
                  {
                    element: "span",
                    textContent: "🔇 Stop the chaos",
                  },
                ],
                eventListeners: [
                  {
                    event: "click",
                    func: function () {
                      sb.onSoundStopClick();
                    },
                  },
                ],
              }
            ]
          },
        ],
      },
    ],
  },
]);
dialogDiv.hidden = true;
elements.appendElements(dialogDiv, dom);
document.body.append(dialogDiv);

sb.onSoundButtonClick = function () {};
sb.onSoundStopClick = function () {};

function createSoundboardButtonDiv(sound, index) {
  var dom = elements.createElementsFromJSON([
    {
      element: "div",
      className: "soundboardButton",
      children: [
        {
          element: "span",
          textContent: sound.name,
        },
      ],
      gid: "sbButton_"+index,
      eventListeners: [
        {
          event: "click",
          func: function () {
            sb.onSoundButtonClick(
              index,
              soundboardMultipliers[soundboardMutliplier].mult
            );
          },
        },
      ],
    },
  ]);
  return dom[0];
}

var soundboardButtonsContainer = elements.getGPId("soundboardButtonsContainer");

async function showSoundboardDialog() {
  try {
    dialogDiv.hidden = false;
  } catch (e) {
    dialog.alert(e);
  }
}

sb.show = showSoundboardDialog;

sb.load = function (soundboardURL, onProgress) {
  if (!onProgress) {
    onProgress = () => {};
  }

  const MAX_CONCURRENT_LOADS = 5;

  return new Promise((accept, reject) => {
    fetchUtils
      .fetchAsJSON(soundboardURL)
      .then((sounds) => {
        let soundsLoaded = 0;
        let currentIndex = 0;
        let activeLoads = 0;
        const loadedPromises = [];

        const tryLoadNext = () => {
          if (currentIndex >= sounds.length) {
            if (activeLoads === 0) {
              // All sounds are done loading
              Promise.all(loadedPromises)
                .then(() => accept())
                .catch(reject);
            }
            return;
          }

          while (
            activeLoads < MAX_CONCURRENT_LOADS &&
            currentIndex < sounds.length
          ) {
            const sound = sounds[currentIndex];
            const index = currentIndex;
            currentIndex++;
            activeLoads++;

            const soundPromise = audioEngine
              .loadSoundFromURL(sound.url)
              .then((soundData) => {
                soundsLoaded++;
                onProgress(soundsLoaded, sounds.length);
                sound.data = soundData;
              })
              .catch(reject)
              .finally(() => {
                activeLoads--;
                tryLoadNext();
              });

            loadedPromises.push(soundPromise);

            const button = createSoundboardButtonDiv(sound, index);
            soundboardButtonsContainer.append(button);
          }
        };

        tryLoadNext();

        loadedSounds = sounds;
        sb.loadedSounds = sounds;
      })
      .catch(reject);
  });
};

var soundIdCounter = 0;

sb.playSound = function (index, mult = 1) {
  var sound = loadedSounds[index];

  if (sound) {
    var player = new audioEngine.Player(sound.data);
    player.volume = (soundboardVolume / 100) * mult;
    soundIdCounter += 1;
    player._id = soundIdCounter;
    player._mult = mult;

    player.onended = function () {
      var newPlayingSounds = [];
      for (var otherPlayer of playingSounds) {
        if (otherPlayer._id !== player._id) {
          newPlayingSounds.push(otherPlayer);
        }
      }
      playingSounds = newPlayingSounds;
    };
    player.play();

    playingSounds.push(player);
  }
};

sb.stopAll = function () {
  for (var player of playingSounds) {
    player.pause();
  }
};

setInterval(() => {
  for (var player of playingSounds) {
    player.volume = (soundboardVolume / 100) * player._mult;
  }
}, 1000 / 30);

module.exports = sb;
