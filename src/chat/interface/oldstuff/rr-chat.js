var soundboardEnabled = true;

function handleErrors(e) {
  //Handle errors and display them to the user,
  //also log inside the devloper tools console
  //to try to give further information about this error.
  document.body.style.color = "red";
  document.body.style.background = "black";
  document.body.style.fontFamily = "arial";
  document.body.innerHTML =
    "<h1>Whoops!</h1>" +
    e +
    "<hr>" +
    "The page encountered an unhandled error. This means that Random Rants could not start successfully. Try reloading by clicking the refresh button on your browser, or click the button below to preform a refresh.<br>" +
    "Try clearing your browser cookies if this error continues.<br>If you're a developer, check the developer console for further details about this error message.<br>" +
    '<button onclick="window.location.reload()">Refresh</button>';
  console.error(e);
}
var dialog = window.dialog;
var rrLoadingStatus = document.getElementById("rrLoadingStatusSpan");

var stunServerList = [
  {
    label: "Google Server",
    value: "stun:stun.l.google.com:19302",
  },
  {
    label: "Freecall.com",
    value: "stun:stun.freecall.com:3478",
  },
  {
    label: "Aeta.com",
    value: "stun:stun.aeta.com:3478",
  },
  {
    label: "Awa-shima.com",
    value: "stun:stun.awa-shima.com:3478",
  },
  {
    label: "Cope.es",
    value: "stun:stun.cope.es:3478",
  },
  {
    label: "Stunprotocol.org",
    value: "stun:stun.stunprotocol.org:3478",
  },
  {
    label: "Twilio.com",
    value: "stun:global.stun.twilio.com:3478",
  },
];

(async function () {
  try {
    rrLoadingStatus.textContent = "Loading...";
    var acp = "egg123";

    var activationDiv = document.getElementById("activationDiv");

    var messages = document.getElementById("messages");

    var screenCaptureUsername = document.getElementById(
      "screenCaptureUsername",
    );

    var loadingCVS = document.createElement("canvas");
    var loadingCTX = loadingCVS.getContext("2d");
    var img = document.createElement("img");
    img.onload = function () {
      loadingCVS.width = this.width * 2;
      loadingCVS.height = this.height * 2;
      loadingCTX.fillStyle = "black";
      loadingCTX.fillRect(0, 0, this.width, this.height);
      loadingCTX.drawImage(
        this,
        this.width / -2 + loadingCVS.width / 2,
        this.height / -2 + loadingCVS.height / 2,
        this.width,
        this.height,
      );
    };
    img.src = "webrtc.svg";

    var specialRTCIDChars = "abcdefghijklmnopqrstuvwxyz123456789";

    var specialRTCID = "";

    var ind = 0;
    while (ind < 9) {
      specialRTCID +=
        specialRTCIDChars[
          Math.round(Math.random() * (specialRTCIDChars.length - 1))
        ];
      ind += 1;
    }

    var loadingStream = loadingCVS.captureStream(60);
    var soundboardButtons = document.getElementById("soundboardButtons");

    var mainModes = [
      {
        label: "None (Let browser decide)",
        value: "",
      },
      { label: "Store tempomarily (Clears when page closes)", value: "memory" },
      {
        label: "Store in browser (Clears when you clear cookies)",
        value: "storage",
      },
      { label: "Both (Do both of them)", value: "both" },
    ];

    var preloader = {
      preloaded: {},
      groupSettings: {},
      fileLoaded: function (data, url) {},
      groups: [
        {
          id: "profilePictures",
          name: "Profile pictures",
          discription:
            "Profile pictures for every user (including server messages).",
          modes: mainModes,
          default: "none",
        },
        {
          id: "sounds",
          name: "Random rants sounds",
          discription: "Every sound used by Random Rants.",
          modes: mainModes,
          default: "none",
        },
        {
          id: "serverCheck",
          name: "Server check during page loading",
          discription:
            "Warns you if the file server is down, or unaccessable during loading. Disabling will make loading times faster, but with a cost of waiting longer for profile pictures to load (unless they are preloaded with storage).",
          modes: [
            {
              label: "On",
              value: "on",
            },
            {
              label: "Off",
              value: "off",
            },
          ],
          default: "off",
        },
        {
          id: "disableWebrtc",
          name: "Disable WebRTC",
          discription:
            "WARNING!!!! This disables the screenshare functionality and camera functions.",
          modes: [
            {
              label: "On",
              value: "on",
            },
            {
              label: "Off",
              value: "off",
            },
          ],
          default: "off",
        },
        {
          id: "webrtcServer",
          name: "WebRTC Stun server",
          discription:
            "(RELOAD RECOMMENDED IF CHANGED) This only changes the server used to send and recive data between WebRTC connections. However, if the server used for WebRTC is blocked/unavailiable for the host, or you, then you won't be able to see their WebRTC content.",
          modes: stunServerList,
          default: stunServerList[0].value,
        },
      ],
      clearPreloadStorage: function clearPreloadStorage() {
        var thingsCleared = 0;
        for (var key in localStorage) {
          if (!localStorage.hasOwnProperty(key)) continue;
          if (key.startsWith("preload_")) {
            localStorage.removeItem(key);
            thingsCleared += 1;
          }
        }
        return thingsCleared;
      },
      getURL: function getURL(url, group) {
        return new Promise(async (accept, reject) => {
          try {
            if (
              preloader.groupSettings[group] !== "storage" &&
              preloader.groupSettings[group] !== "both"
            ) {
              accept(url);
              return;
            }
            if (
              preloader.groupSettings[group] == "storage" ||
              preloader.groupSettings[group] == "both"
            ) {
              var preloadLocalStorage = localStorage.getItem("preload_" + url);
              if (preloadLocalStorage) {
                preloader.fileLoaded(preloadLocalStorage, url);
                accept(preloadLocalStorage);
              }
            }
            if (!preloader.preloaded[url]) {
              var a = await fetch(url);
              var b = await a.blob();
              if (!a.ok) {
                accept(url);
                return;
              }
              var reader = new FileReader();
              reader.onload = function () {
                if (
                  preloader.groupSettings[group] == "memory" ||
                  preloader.groupSettings[group] == "both"
                ) {
                  preloader.preloaded[url] = reader.result;
                }
                if (
                  preloader.groupSettings[group] == "storage" ||
                  preloader.groupSettings[group] == "both"
                ) {
                  if (reader.result.length < 3000) {
                    localStorage.setItem("preload_" + url, reader.result);
                  }
                }
                preloader.fileLoaded(reader.result, url);
                accept(reader.result);
              };
              reader.onerror = function () {
                accept(url);
              };
              reader.readAsDataURL(b);
            } else {
              preloader.fileLoaded(preloader.preloaded[url], url);
              accept(preloader.preloaded[url]);
            }
          } catch (e) {
            accept(url);
          }
        });
      },
    };
    window.preloader = preloader;

    setInterval(() => {
      if (window.screenShareClient) {
        if (preloader.groupSettings.webrtcServer) {
          window.screenShareClient.iceServers[0].urls =
            preloader.groupSettings.webrtcServer;
        }
      }
    }, 1000 / 30);

    var fileLoadingSettings = document.getElementById("fileLoadingSettings");
    var fileLoadingSettingsExit = document.getElementById(
      "fileLoadingSettingsExit",
    );
    var loadingSettingsProperties = document.getElementById(
      "loadingSettingsProperties",
    );

    var loadingSettingsSize = document.getElementById("loadingSettingsSize");
    var clearLoadingStorage = document.getElementById("clearLoadingStorage");

    clearLoadingStorage.onclick = function () {
      dialog.confirm("Do you really want to do this?").then((confirmed) => {
        if (confirmed) {
          var cleared = preloader.clearPreloadStorage();
          dialog.alert(
            `Cleared ${cleared} cached files. Reloading Random Rants is recommended.`,
          );
        }
      });
    };

    var preloaderSettingsSelections = {};

    function savePreloaderSettings() {
      localStorage.setItem(
        "preloaderSettings",
        JSON.stringify(preloader.groupSettings, null, ""),
      );
    }

    var loadedSize = 0;

    function updateSizeText() {
      loadingSettingsSize.textContent =
        Math.round(loadedSize * 1) / 1 + "MB (May not be accurate)";
    }

    preloader.fileLoaded = function (data) {
      loadedSize += data.length / 1e6;
      updateSizeText();
    };
    updateSizeText();

    function makeGroupDiv(group) {
      var div = document.createElement("div");
      div.className = "storageSettingOption";

      var textDiv = document.createElement("div");
      textDiv.style.maxWidth = "300px";
      textDiv.style.width = "100%";
      div.append(textDiv);

      var name = document.createElement("span");
      name.textContent = group.name;
      name.setAttribute("cssheader", "");
      textDiv.append(name);

      textDiv.append(document.createElement("br"));

      var discription = document.createElement("span");
      discription.textContent = group.discription;
      discription.setAttribute("cssdiscription", "");
      textDiv.append(discription);

      var selectContainer = document.createElement("div");
      selectContainer.setAttribute("selectcontainer", "");
      div.append(selectContainer);

      var select = document.createElement("select");
      select.className = "roundborder inputText1";
      selectContainer.append(select);

      for (var mode of group.modes) {
        var option = document.createElement("option");
        option.textContent = mode.label;
        option.value = mode.value;
        if (group.default == mode.value) {
          option.selected = true;
        }
        if (typeof preloader.groupSettings[group.id] !== "undefined") {
          if (preloader.groupSettings[group.id] == mode.value) {
            option.selected = true;
          } else {
            option.selected = false;
          }
        } else {
          preloader.groupSettings[group.id] = mode.default;
        }
        select.append(option);
      }

      select.oninput = function () {
        preloader.groupSettings[group.id] = select.value;
        savePreloaderSettings();
      };

      preloaderSettingsSelections[group.id] = select;

      return div;
    }

    function setupLoadingSettingsProperties() {
      for (var child of loadingSettingsProperties.children) {
        child.remove();
      }
      for (var group of preloader.groups) {
        var div = makeGroupDiv(group);
        loadingSettingsProperties.append(div);
      }
    }

    if (localStorage.getItem("preloaderSettings")) {
      preloader.groupSettings = JSON.parse(
        localStorage.getItem("preloaderSettings"),
      );
    }

    setupLoadingSettingsProperties();

    window.openFileLoadingSettings = function () {
      fileLoadingSettings.hidden = false;
    };
    fileLoadingSettingsExit.onclick = function () {
      fileLoadingSettings.hidden = true;
    };

    window.specialCommandsActivated = false;
    function addVIPRoom() {
      var serverselect = document.getElementById("Server");
      var option = document.createElement("option");
      option.textContent = "VIP/Admin room";
      option.setAttribute("title", "VIP/Admin room");
      option.setAttribute("value", "viproom");
      option.selected = true; // Set the new option as selected
      serverselect.append(option); // Append the option to the dropdown
    }
    if (localStorage.getItem("activated") == acp) {
      window.specialCommandsActivated = true;
      activationDiv.hidden = true;
      addVIPRoom();
    }

    var activateCommandPassword = document.getElementById(
      "activateCommandPassword",
    );
    var activateCommandsInput = document.getElementById(
      "activateCommandsPassword",
    );
    activateCommandPassword.onclick = function () {
      if (window.specialCommandsActivated) {
        dialog.alert("Already activated!");
      } else {
        if (acp == activateCommandsInput.value) {
          window.specialCommandsActivated = true;
          activationDiv.hidden = true;
          dialog.alert("Activation successful!");
          localStorage.setItem("activated", acp);
          addVIPRoom();
          if (window.updateServerList) {
            window.updateServerList();
          }
        } else {
          dialog.alert("Sorry, this is not the password.");
        }
      }
    };
    var emojiserver = ""; //Leave this empty for this site as the server.
    function gvbvdxxChatEmoji(gcimg) {
      return `https://jasonglenevans.github.io/GvbvdxxChatEmojis/${gcimg}`;
    }

    var emojisV2Emojis = {};

    var emojisV2 = [
      {
        type: "header",
        label: "Sonic Icons",
      },
      {
        type: "emoji",
      },
    ];

    var gcEmojis = [
      "I_EGG.ICO",
      "I_EGG2.ICO",
      "I_KNACK.ICO",
      "I_KNACS2.ICO",
      "I_MILES.ICO",
      "I_MILES2.ICO",
      "I_SONIC.ICO",
      "I_SONIC2.ICO",
      "SONIC_SCREAM.png",
      "SONIC_BLUE_SPHERE.png",
      "sonic-tails.gif",
      "MSG_1.gif",
      "MSG_2.png",
      "MSG_3.png",
      "MSG_4.png",
      "MSG_5.png",
      "MSG_6.png",
      "MSG_7.png",
      "MSG_8.png",
      "MSG_9.png",
      "CATTO_BOI.gif",
      "CHEESEPUFFS.jpg",
    ];
    var gcEmojisURL = [];

    for (var img of gcEmojis) {
      gcEmojisURL.push(gvbvdxxChatEmoji(img));
    }
    var firstGCEmoji = gvbvdxxChatEmoji(gcEmojis[0]);
    var sections = {
      "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/costume1.svg?v=1725635781707":
        "Random Rants Emojis",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/audio.svg":
        "Random Rants Icon Emojis",
      "https://random-rants-chat.github.io/randomrants-emojis/img/smw-bored.png":
        "Pixel Emojis",
    };
    sections[firstGCEmoji] = "Gvbvdxx Chat Emojis";

    var emojis = gcEmojisURL.concat([
      //Place urls in quotes, and make sure to add commas at the end of the quotes to prevent random errors from happening.
      "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/costume1.svg?v=1725635781707",
      "https://random-rants-chat.github.io/randomrants-emojis/img/guy_pointing.svg",
      "https://random-rants-chat.github.io/randomrants-emojis/img/mrbeaast.svg",
      "https://random-rants-chat.github.io/randomrants-emojis/img/obama.svg",
      "https://random-rants-chat.github.io/randomrants-emojis/img/whatthe.jpg",
      "https://random-rants-chat.github.io/randomrants-emojis/img/anotherthing.svg",
      "https://random-rants-chat.github.io/randomrants-emojis/img/sad.svg",
      "https://random-rants-chat.github.io/randomrants-emojis/img/thing.svg",
      "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/amogus.svg?v=1725635605024",
      "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/_ROCK%20(1).svg?v=1725635989147",
      "https://random-rants-chat.github.io/randomrants-emojis/img/dance.gif",
      "https://random-rants-chat.github.io/randomrants-emojis/img/sonk.png",
      "https://random-rants-chat.github.io/randomrants-emojis/img/2.png",
      "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/uVnwhMjZTg1uk3vsdiCc.jpeg?v=1724254756623",
      "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/sonic-sonic-the-hedgehog.gif?v=1714953946021",
      "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/ezgif-4-71ea9f9245.gif?v=1714954639819",
      "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/sonic-dance-fast-goofy-meme.gif?v=1714954633775",
      "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/tails-sonic%20(1).gif?v=1714954866938",
      "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/loaf.png?v=1714955508974",
      "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/spongebob-squarepants-leaving.gif?v=1714955760113",
      "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/Delete that Right Now Sonic Meme?v=1714955952963",
      "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/Those games are very cool Mario loves you?v=1714956681859",
      "https://cdn.glitch.global/7c96d5e9-c306-40b6-a0ef-5f5da70ecb6b/Sad2.png?v=1715340685313",
      "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/sonic-shocked.gif?v=1714955288854",
      "https://cdn.glitch.global/7c96d5e9-c306-40b6-a0ef-5f5da70ecb6b/cat.png?v=1715342049891",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/audio.svg?n=1",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/clearchat.svg?n=1",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/image.svg?n=1",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/import.svg?n=1",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/mail.svg?n=1",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/mic-active.svg?n=1",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/mic.svg?n=1",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/nomail.svg?n=1",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/screenshare.svg?n=1",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/send.svg?n=1",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/sendhidden.svg?n=1",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/stopscreenshare.svg?n=1",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/video.svg?n=1",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/emoji.svg?n=1",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/emoji-angry.svg?n=1",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/emoji-crying.svg?n=1",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/emoji-eyebrow.svg?n=1",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/emoji-hmm.svg",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/emoji-laughing.svg",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/emoji-meh.svg",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/emoji-oh.svg",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/emoji-sad.svg",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/emoji-sad2.svg",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/emoji-slightcry.svg",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/emoji-straightface.svg",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/emoji-wink.svg",
      "https://random-rants-chat.github.io/randomrants-emojis/icons/emoji-nerd.svg",
      "https://random-rants-chat.github.io/randomrants-emojis/img/smw-bored.png",
      "https://random-rants-chat.github.io/randomrants-emojis/img/smw-grin.png",
      "https://random-rants-chat.github.io/randomrants-emojis/img/smw-laugh.gif",
      "https://random-rants-chat.github.io/randomrants-emojis/img/smw-smile.png",
      "https://random-rants-chat.github.io/randomrants-emojis/img/smw-straightface.png",
      "https://random-rants-chat.github.io/randomrants-emojis/img/smw-uhoh.png",
      "https://random-rants-chat.github.io/randomrants-emojis/img/smw-uhoh2.png",
      "https://random-rants-chat.github.io/randomrants-emojis/img/coin.gif",
      "https://random-rants-chat.github.io/randomrants-emojis/img/num0.png",
      "https://random-rants-chat.github.io/randomrants-emojis/img/num1.png",
      "https://random-rants-chat.github.io/randomrants-emojis/img/num2.png",
      "https://random-rants-chat.github.io/randomrants-emojis/img/num3.png",
      "https://random-rants-chat.github.io/randomrants-emojis/img/num4.png",
      "https://random-rants-chat.github.io/randomrants-emojis/img/num5.png",
      "https://random-rants-chat.github.io/randomrants-emojis/img/num6.png",
      "https://random-rants-chat.github.io/randomrants-emojis/img/num7.png",
      "https://random-rants-chat.github.io/randomrants-emojis/img/num8.png",
      "https://random-rants-chat.github.io/randomrants-emojis/img/num9.png",
    ]);
    var notifcationLogo = "favicon.png";
    function bin2String(array) {
      var result = "";
      for (var i = 0; i < array.length; i++) {
        result += String.fromCharCode(parseInt(array[i], 2));
      }
      return result;
    }
    function string2Bin(str) {
      var result = [];
      for (var i = 0; i < str.length; i++) {
        result.push(str.charCodeAt(i));
      }
      return result;
    }

    var cssFonts = [
      {
        label: "Arial",
        value: "arial",
      },
      {
        label: "Times New Roman",
        value: "serif",
      },
      {
        label: "Sans Serif",
        value: "sans-serif",
      },
      {
        label: "Monospace",
        value: "monospace",
      },
      {
        label: "Cursive",
        value: "cursive",
      },
      {
        label: "Fantasy",
        value: "fantasy",
      },
      {
        label: "Microsoft Comic Sans",
        value: "comicsansms",
      },
      {
        label: "Jersey 15 (Google Fonts)",
        value: '"Jersey 15"',
      },
      {
        label: "Jacquard 12 (Google Fonts)",
        value: '"Jacquard 12 Charted"',
      },
      {
        label: "Pixelify Sans (Google Fonts)",
        value: '"Pixelify Sans"',
      },
      {
        label: "Permanent Marker (Google Fonts)",
        value: '"Permanent Marker"',
      },
      {
        label: "Tektur (Google Fonts)",
        value: '"Tektur"',
      },
      {
        label: "Pixel (Scratch 3.0 Fonts)",
        value: '"Pixel"',
      },
    ];
    var defaultCssProperties = {
      "--bg-color": {
        label: "Main background color",
        iniSection: "MainStyles",
        iniName: "BGColor",
        type: "color",
        value: "#b8b8b8",
      },
      "--header-color": {
        label: "Header color",
        iniSection: "HeaderStyles",
        iniName: "BGColor",
        type: "color",
        value: "#b8b8b8",
      },
      "--main-font": {
        label: "Default font",
        iniSection: "MainStyles",
        iniName: "FontName",
        type: "font",
        value: "arial",
      },
      "--main-text-color": {
        label: "Default text color",
        iniSection: "MainStyles",
        iniName: "TextColor",
        type: "color",
        value: "black",
      },
      "--input-bg-color": {
        label: "Input background color",
        iniSection: "InputStyles",
        iniName: "BGColor",
        type: "color",
        value: "#363636",
      },
      "--input-text-color": {
        label: "Input text color",
        iniSection: "InputStyles",
        iniName: "TextColor",
        type: "color",
        value: "#c9c9c9",
      },
      "--input-border-color": {
        label: "Input border color",
        iniSection: "InputStyles",
        iniName: "BorderColor",
        type: "color",
        value: "#1f1f1f",
      },
      "--input-border-width": {
        label: "Input border width",
        type: "number",
        value: 3,
        min: 0,
        max: 20,
        end: "px",
        iniSection: "InputStyles",
        iniName: "BorderWidth",
      },
      "--messages-bg-color": {
        label: "Messages box background color",
        type: "color",
        value: "#919191",
        iniSection: "MessageBoxStyles",
        iniName: "BGColor",
      },
      "--messages-text-color": {
        label: "Messages default text color",
        type: "color",
        value: "#fcfcfc",
        iniSection: "MessageStyles",
        iniName: "TextColor",
      },
      "--profile-background": {
        label: "Profile picture background color",
        type: "color",
        value: "#969696",
        iniSection: "ProfileStyles",
        iniName: "BGColor",
      },
      "--profile-border-color": {
        label: "Profile picture border color",
        type: "color",
        value: "#7d7d7d",
        iniSection: "ProfileStyles",
        iniName: "BorderColor",
      },
      "--separator-color": {
        label: "Seperator color",
        type: "color",
        value: "#696969",
        iniSection: "SeperatorStyles",
        iniName: "Color",
      },
      "--textbox-bg-color": {
        label: "Textbox background color",
        type: "color",
        value: "#e0e0e0",
        iniSection: "TextboxInputStyles",
        iniName: "BGColor",
      },
      "--textbox-border-color": {
        label: "Textbox border color",
        type: "color",
        value: "#696969",
        iniSection: "TextboxInputStyles",
        iniName: "BorderColor",
      },
      "--button-bg-color": {
        label: "Button background color",
        type: "color",
        value: "#e0e0e0",
        iniSection: "ButtonStyles",
        iniName: "BGColor",
      },
      "--button-text-color": {
        label: "Button text color",
        type: "color",
        value: "#696969",
        iniSection: "ButtonStyles",
        iniName: "TextColor",
      },
      "--button-hover-bg-color": {
        label: "Button background color (When cursor over button)",
        type: "color",
        value: "#f2f2f2",
        iniSection: "ButtonStyles",
        iniName: "HoverBGColor",
      },
      "--button-disabled-color": {
        label: "Button background color (When disabled/off)",
        type: "color",
        value: "#5e5e5e",
        iniSection: "ButtonStyles",
        iniName: "DisabledBGColor",
      },
      "--loading-spinner-color": {
        label: "Loading spinner color",
        type: "color",
        value: "#878787",
        iniSection: "LoadingSpinnerStyles",
        iniName: "Color",
      },
      "--border-radius": {
        label: "Default border radius",
        type: "number",
        value: 3,
        min: 0,
        max: 20,
        end: "px",
        iniSection: "MainStyles",
        iniName: "BorderRadius",
      },
      "--profile-border-radius": {
        label: "Profile border radius",
        type: "number",
        value: 64,
        min: 0,
        max: 100,
        end: "px",
        iniSection: "ProfileStyles",
        iniName: "BorderRadius",
      },
      "--popup-box-bg-color": {
        label: "Popup dialog background color",
        type: "color",
        value: "#FFFFFF",
        iniSection: "PopupBoxStyles",
        iniName: "BGColor",
      },
      "--popup-box-text-color": {
        label: "Popup dialog text color",
        type: "color",
        value: "#000000",
        iniSection: "PopupBoxStyles",
        iniName: "TextColor",
      },
      "--link-text-color": {
        label: "Link text color",
        type: "color",
        value: "#4287f5",
        iniSection: "LinkStyles",
        iniName: "TextColor",
      },
      "--main-font-size": {
        label: "Default font size (in pixels)",
        type: "number",
        value: 15,
        min: 0,
        max: 150,
        end: "px",
        iniSection: "MainStyles",
        iniName: "MainFontSize",
      },
      "--selected-emoji-popup-dialog-bg-color": {
        label: "Emoji Added Popup (Background Color)",
        type: "color",
        value: "#15e64d",
        iniSection: "EmojiAddedDialogStyles",
        iniName: "BGColor",
      },
      "--selected-emoji-popup-dialog-border-color": {
        label: "Emoji Added Popup (Border Color)",
        type: "color",
        value: "#23a646",
        iniSection: "EmojiAddedDialogStyles",
        iniName: "BorderColor",
      },
      "--selected-emoji-popup-dialog-text-color": {
        label: "Emoji Added Popup (Text Color)",
        type: "color",
        value: "#e6ffec",
        iniSection: "EmojiAddedDialogStyles",
        iniName: "TextColor",
      },
      "--selected-emoji-popup-dialog-border-width": {
        label: "Emoji Added Popup (Border Width)",
        type: "number",
        value: 2,
        min: 0,
        max: 150,
        end: "px",
        iniSection: "EmojiAddedDialogStyles",
        iniName: "BorderWidth",
      },
      "--server-notifcation-color": {
        label: "Server Notifcation Color",
        type: "color",
        value: "#ffd000",
        iniSection: "ServerNotifcationStyles",
        iniName: "Color",
      },
      "--default-font-weight": {
        label: "Main font weight",
        type: "number",
        value: 0,
        min: 0,
        max: 1000,
        iniSection: "MainStyles",
        iniName: "FontWeight",
      },
      "--connection-status-normal-color": {
        label: "(Connection Status) Normal Color",
        type: "color",
        value: "#000000",
        iniSection: "ConnectionStatusStyles",
        iniName: "NormalColor",
      },
      "--connection-status-connected-color": {
        label: "(Connection Status) Success Color",
        type: "color",
        value: "#039e00",
        iniSection: "ConnectionStatusStyles",
        iniName: "SuccessColor",
      },
      "--connection-status-error-color": {
        label: "(Connection Status) Error Color",
        type: "color",
        value: "#9e0000",
        iniSection: "ConnectionStatusStyles",
        iniName: "ErrorColor",
      },
      "--color-select-bg-color": {
        label: "(Color selection box) Background Color",
        type: "color",
        value: "#9e9e9e",
        iniSection: "ColorSelectorBoxStyles",
        iniName: "BGColor",
      },
      "--color-select-border-color": {
        label: "(Color selection box) Border Color",
        type: "color",
        value: "#858585",
        iniSection: "ColorSelectorBoxStyles",
        iniName: "BorderColor",
      },
      "--color-select-highlight-color": {
        label: "(Color selection box) Highlight Border Color",
        type: "color",
        value: "#FFFFFF",
        iniSection: "ColorSelectorBoxStyles",
        iniName: "HighlightColor",
      },
      "--soundboard-button-bgcolor": {
        label: "(Soundboard) Button background color",
        type: "color",
        value: "#a1a1a1",
        iniSection: "SoundboardStyles",
        iniName: "ButtonColor",
      },
      "--soundboard-button-hover-bgcolor": {
        label: "(Soundboard) Button hover background color",
        type: "color",
        value: "#bfbfbf",
        iniSection: "SoundboardStyles",
        iniName: "HoveredButtonColor",
      },
      "--soundboard-button-border-color": {
        label: "(Soundboard) Button hover border color",
        type: "color",
        value: "#545454",
        iniSection: "SoundboardStyles",
        iniName: "ButtonBorderColor",
      },

      "--soundboard-stop-button-bgcolor": {
        label: "(Soundboard) Stop Button background color",
        type: "color",
        value: "#d90000",
        iniSection: "SoundboardStyles",
        iniName: "ButtonColor",
      },
      "--soundboard-stop-button-hover-bgcolor": {
        label: "(Soundboard) Stop Button hover background color",
        type: "color",
        value: "#ff0000",
        iniSection: "SoundboardStyles",
        iniName: "HoveredButtonColor",
      },
      "--soundboard-stop-button-border-color": {
        label: "(Soundboard) Stop Button hover border color",
        type: "color",
        value: "#750000",
        iniSection: "SoundboardStyles",
        iniName: "ButtonBorderColor",
      },
      /*"--usercolors-1": {
        label: "(User Pallete Colors) Color 1",
        type: "color",
        value: "#ed1c1c",
        iniSection: "UserColorPallete",
        iniName: "Color1",
      },
      "--usercolors-2": {
        label: "(User Pallete Colors) Color 2",
        type: "color",
        value: "#ed811c",
        iniSection: "UserColorPallete",
        iniName: "Color2",
      },
      "--usercolors-3": {
        label: "(User Pallete Colors) Color 3",
        type: "color",
        value: "#eddf1c",
        iniSection: "UserColorPallete",
        iniName: "Color3",
      },
      "--usercolors-4": {
        label: "(User Pallete Colors) Color 4",
        type: "color",
        value: "#b5ed1c",
        iniSection: "UserColorPallete",
        iniName: "Color4",
      },
      "--usercolors-5": {
        label: "(User Pallete Colors) Color 5",
        type: "color",
        value: "#69ed1c",
        iniSection: "UserColorPallete",
        iniName: "Color5",
      },
      "--usercolors-6": {
        label: "(User Pallete Colors) Color 6",
        type: "color",
        value: "#1ced58",
        iniSection: "UserColorPallete",
        iniName: "Color6",
      },
      "--usercolors-7": {
        label: "(User Pallete Colors) Color 7",
        type: "color",
        value: "#1cedbc",
        iniSection: "UserColorPallete",
        iniName: "Color7",
      },
      "--usercolors-8": {
        label: "(User Pallete Colors) Color 8",
        type: "color",
        value: "#1cceed",
        iniSection: "UserColorPallete",
        iniName: "Color8",
      },
      "--usercolors-9": {
        label: "(User Pallete Colors) Color 9",
        type: "color",
        value: "#1c85ed",
        iniSection: "UserColorPallete",
        iniName: "Color9",
      },
      "--usercolors-10": {
        label: "(User Pallete Colors) Color 10",
        type: "color",
        value: "#201ced",
        iniSection: "UserColorPallete",
        iniName: "Color10",
      },
      "--usercolors-11": {
        label: "(User Pallete Colors) Color 11",
        type: "color",
        value: "#6c1ced",
        iniSection: "UserColorPallete",
        iniName: "Color11",
      },
      "--usercolors-12": {
        label: "(User Pallete Colors) Color 12",
        type: "color",
        value: "#ae1ced",
        iniSection: "UserColorPallete",
        iniName: "Color12",
      },
      "--usercolors-13": {
        label: "(User Pallete Colors) Color 13",
        type: "color",
        value: "#df1ced",
        iniSection: "UserColorPallete",
        iniName: "Color13",
      },
      "--usercolors-14": {
        label: "(User Pallete Colors) Color 14",
        type: "color",
        value: "#ed1cae",
        iniSection: "UserColorPallete",
        iniName: "Color14",
      },
      "--usercolors-15": {
        label: "(User Pallete Colors) Color 15",
        type: "color",
        value: "#ed1c42",
        iniSection: "UserColorPallete",
        iniName: "Color15",
      },*/
      "--storage-group-background-color": {
        label: "(Loading Settings Info Box) Background Color",
        type: "color",
        value: "#dedede",
        iniSection: "LoadingSettingsInfoBox",
        iniName: "BGColor",
      },
      "--storage-group-border-color": {
        label: "(Loading Settings Info Box) Border Color",
        type: "color",
        value: "#bdbdbd",
        iniSection: "LoadingSettingsInfoBox",
        iniName: "BorderColor",
      },
      "--storage-group-text-color": {
        label: "(Loading Settings Info Box) Text Color",
        type: "color",
        value: "#4a4a4a",
        iniSection: "LoadingSettingsInfoBox",
        iniName: "TextColor",
      },
      //Popup dialog box colors.
      "--popup-dialog-font": {
        label: "(Popup Dialog/Alerts) Message Text Font",
        type: "font",
        value: "arial",
        iniSection: "AlertDialog",
        iniName: "FontColor",
      },
      "--popup-dialog-background": {
        label: "(Popup Dialog/Alerts) Box Background Color",
        type: "color",
        value: "#fff",
        iniSection: "AlertDialogBox",
        iniName: "BackgroundColor",
      },
      "--popup-dialog-border-radius": {
        label: "(Popup Dialog/Alerts) Box Border Radius",
        type: "number",
        value: 10,
        min: 0,
        max: 150,
        end: "px",
        iniSection: "AlertDialogBox",
        iniName: "BorderRadius",
      },
      "--popup-dialog-text-color": {
        label: "(Popup Dialog/Alerts) Message Text Color",
        type: "color",
        value: "#000",
        iniSection: "AlertDialogBox",
        iniName: "TextColor",
      },
      "--popup-dialog-button-background": {
        label: "(Popup Dialog/Alerts) Button Background Color",
        type: "color",
        value: "#5985ff",
        iniSection: "AlertDialogButton",
        iniName: "BackgroundColor",
      },
      "--popup-dialog-button-hover-background": {
        label:
          "(Popup Dialog/Alerts) Button Background Color (When Mouse Over)",
        type: "color",
        value: "#4275ff",
        iniSection: "AlertDialogButton",
        iniName: "HoverBackgroundColor",
      },
      "--popup-dialog-button-text-color": {
        label: "(Popup Dialog/Alerts) Button Text Color",
        type: "color",
        value: "#fff",
        iniSection: "AlertDialogButton",
        iniName: "TextColor",
      },
      "--popup-dialog-button-radius": {
        label: "(Popup Dialog/Alerts) Button Border Radius",
        type: "number",
        value: 5,
        min: 0,
        max: 150,
        end: "px",
        iniSection: "AlertDialogButton",
        iniName: "BorderRadius",
      },
      "--popup-dialog-input-background": {
        label: "(Popup Dialog/Alerts) Text Input Background Color",
        type: "color",
        value: "#fff",
        iniSection: "AlertDialogTextInput",
        iniName: "BackgroundColor",
      },
      "--popup-dialog-input-border-width": {
        label: "(Popup Dialog/Alerts) Text Input Border Width",
        type: "number",
        value: 1.5,
        min: 0,
        max: 150,
        end: "px",
        iniSection: "AlertDialogTextInput",
        iniName: "BorderWidth",
      },
      "--popup-dialog-input-border-color": {
        label: "(Popup Dialog/Alerts) Text Input Border Color",
        type: "color",
        value: "#bababa",
        iniSection: "AlertDialogTextInput",
        iniName: "BorderColor",
      },
      "--popup-dialog-input-border-color": {
        label: "(Popup Dialog/Alerts) Text Input Text Color",
        type: "color",
        value: "#000",
        iniSection: "AlertDialogTextInput",
        iniName: "TextColor",
      },
      "--popup-dialog-message-size": {
        label: "(Popup Dialog/Alerts) Message Text Size",
        type: "number",
        value: 16,
        min: 0,
        max: 150,
        end: "px",
        iniSection: "AlertDialogBox",
        iniName: "TextSize",
      },
    };

    var soundboardSoundZips = ["soundboard.zip"];

    function fetchJSON(url, options) {
      return new Promise((resolve, reject) => {
        fetch(url, options)
          .then((response) => {
            response
              .json()
              .then((json) => {
                resolve(json);
              })
              .catch(reject);
          })
          .catch(reject);
      });
    }
    var soundboardButtonIds = {};
    if (soundboardEnabled) {
      var soundboardSounds = await fetchJSON(
        "https://random-rants-chat.github.io/randomrants-soundboard/soundboard.json",
      );
      var soundboardButtonPlayingBy = {};
      rrLoadingStatus.textContent = "Reading custom soundboard sounds...";
      if (localStorage.getItem("customSBSounds")) {
        var addedsounds = JSON.parse(localStorage.getItem("customSBSounds"));
        for (var newsound of addedsounds) {
          newsound.isCustom = true;
          soundboardSounds.push(newsound);
        }
      }
    }

    function setTitle(title) {
      if (title) {
        document.title = `Random Rants`;
      } else {
        document.title = `Random Rants ${title}`;
      }
    }

    var colorPalleteLength = 22;
    var colorPalleteCSSPrefix = "--usercolors-";

    var LZString = window.LZString;
    window.downloadFileFromURL = async function download(url, name, element) {
      /*var ogTextContent = element.textContent;
      element.title = "Downloading the current file.";
      element.textContent = "Downloading file...";
      try {
        var r = await fetch(url);
        var file = await r.blob();
        var a = document.createElement("a");
        a.href = URL.createObjectURL(file);
        a.download = name;
        a.click();
        element.title = "";
        element.textContent = ogTextContent;
      } catch (e) {
        element.textContent = `Error! (Hover for details)`;
        element.title = e.toString();
      }*/
      var a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.target = "_blank";
      a.click();
    };
    try {
      await (async function () {
        var warningColor = "var(--server-notifcation-color)";
        var defaultProfile = "defaultpfp.svg";
        window.profilePicture = defaultProfile;
        window.serverProfilePicture = "warningsign.svg";

        window.usercolor = "#000000";

        var joinButton = document.getElementById("join");
        var username = document.getElementById("username");
        var usernameInputElement = username;
        var usernameElement = username;
        var savedUsername = localStorage.getItem("username");
        var profilecolor = document.getElementById("profilecolor");
        var savedProfileColor = localStorage.getItem("profileColor");
        var resetProfile = document.getElementById("resetPFP");

        var colorPalletes = document.getElementById("colorPalletes");

        var fromColorPallete = document.getElementById("fromColorPallete");
        var fromColor = document.getElementById("fromColor");

        var fromColorPalleteButton = document.getElementById(
          "fromColorPalleteButton",
        );
        var fromColorButton = document.getElementById("fromColorButton");

        window.chat = {
          server: class {
            constructor() {
              this.getWebsocket = function () {
                return window.websocket;
              };
              this.leaveChat = function (options) {
                window.location.reload();
              };
              this.fakeMessage = function (options) {
                if (true) {
                  var username = usernameElement.value;
                  var pluginextra = "";
                  if (options.name) {
                    pluginextra += " - " + options.name;
                  }
                  var data = {
                    username: "[server" + pluginextra + "]",
                    message: options.message,
                    profile: window.serverProfilePicture,
                    ip: "server.0.0.0.0",
                    room: window.server,
                    color: options.color,
                    activated: window.specialCommandsActivated,
                  };

                  showMessageChat(data);
                }
              };
              this.sendMessage = function (options) {
                if (true) {
                  var username = usernameElement.value;
                  var pluginextra = "";
                  if (options.name) {
                    pluginextra += " - " + options.name;
                  }
                  var data = {
                    username: "[server" + pluginextra + "]",
                    message: options.message,
                    profile: window.serverProfilePicture,
                    ip: "server.0.0.0.0",
                    room: window.server,
                    color: options.color,
                    activated: window.specialCommandsActivated,
                  };

                  window.websocket.send(JSON.stringify(data));
                }
              };
              this.sendMessageUser = function (options) {
                var username = usernameElement.value;

                var data = {
                  username: username,
                  message: options.message,
                  profile: window.profilePicture,
                  ip: window.currentIP,
                  room: window.server,
                  color: options.color,
                  activated: window.specialCommandsActivated,
                };
                window.websocket.send(JSON.stringify(data));
              };
              this.banUser = function (options) {
                localStorage.setItem("banded", "yes");
                window.location.reload();
              };
              this.elements = {
                typedOutMessage: document.getElementById("text"),
              };
              this.clearChat = function () {
                window.messages.children[0].innerHTML = "";
              };
              this.addEventListener = function (eventName, funct) {
                try {
                  window.chat.listeners["on" + eventName].push(funct);
                } catch (e) {}
              };
            }
          },
          audio: class {
            constructor() {
              this.notifySound = function () {
                window.notify.currentTime = 0;
                window.notify.play();
              };
              this.clickSound = function () {
                window.click.currentTime = 0;
                window.click.play();
              };
              this.typeSound = function () {
                window.type.currentTime = 0;
                window.type.play();
              };
            }
          },
          listeners: { onmessage: [], onsend: [] },
        };

        function addColorPalleteDiv(color) {
          var div = document.createElement("div");
          div.className = "colorPaleteSelectButton";
          div.id = "usercolor_button_" + color;
          div.style.backgroundColor = color;
          if (usercolor == color) {
            div.setAttribute("selected", "");
          }
          div.onclick = function () {
            var otherDiv = document.getElementById(
              "usercolor_button_" + usercolor,
            );
            if (otherDiv) {
              otherDiv.removeAttribute("selected");
            }
            usercolor = color;
            div.setAttribute("selected", "");
            localStorage.setItem("profileColor", usercolor);
          };
          return div;
        }

        function setColorValue() {
          profilecolor.value = usercolor;
        }

        function addColorPalletes() {
          colorPalletes.innerHTML = "";
          var i = 1; //Due to css variable names being indexed by 1, the index will have to be set to 1.
          while (i < colorPalleteLength) {
            var div = addColorPalleteDiv(`var(${colorPalleteCSSPrefix}${i})`);
            colorPalletes.append(div);
            i += 1;
          }
        }

        function setUsernameColorMode(m) {
          if (m) {
            fromColor.hidden = true;
            fromColorPallete.hidden = false;
            fromColorButton.hidden = false;
            fromColorPalleteButton.hidden = true;
            addColorPalletes();
          } else {
            fromColor.hidden = false;
            fromColorPallete.hidden = true;
            fromColorButton.hidden = true;
            fromColorPalleteButton.hidden = false;
            usercolor = "#000000";
            addColorPalletes();
            setColorValue();
          }
        }

        fromColorPalleteButton.onclick = function () {
          dialog
            .confirm(
              "Switching back to custom color will delete your original color, continue?",
            )
            .then((confirmed) => {
              if (confirmed) {
                setUsernameColorMode(true);
              }
            });
        };
        fromColorButton.onclick = function () {
          setUsernameColorMode(false);
        };
        setUsernameColorMode(false);

        //Join button
        var canJoin = false;
        var usernameMessage = "";
        function updateUsernameMessage() {
          var usererror = document.getElementById("errorMessageUsername");
          usererror.textContent = usernameMessage;
          if (usernameMessage.length > 0) {
            usererror.innerHTML += "<br>";
            joinButton.disabled = true;
          } else {
            joinButton.disabled = false;
          }
        }
        window.checkCanJoin = function () {
          if (username.value.length > 0) {
            if (username.value.indexOf(" ") > -1) {
              usernameMessage = "Username can't contain spaces.";
              canJoin = false;
            } else {
              if (username.value.indexOf("@") > -1) {
                usernameMessage = "Username can't contain the @ character.";
                canJoin = false;
              } else {
                if (username.value.indexOf("*") > -1) {
                  usernameMessage = "Username can't contain the * character.";
                  canJoin = false;
                } else {
                  if (username.value.length > 30) {
                    usernameMessage =
                      "Username can't be greater than 30 characters.";
                    canJoin = false;
                  } else {
                    usernameMessage = "";
                    canJoin = true;
                  }
                }
              }
            }
          } else {
            usernameMessage = "Username needs to be more than 0 characters.";
            canJoin = false;
          }
          updateUsernameMessage();
        };
        joinButton.addEventListener("click", () => {
          window.checkCanJoin();
          if (canJoin) {
            document.getElementById("usernameSetup").hidden = true;
            document.getElementById("chat").hidden = false;
            window.server = document.getElementById("Server").value;
            window.start();
          } else {
            window.scroll({
              top: 0,
              left: 0,
              behavior: "smooth",
            });
          }
        });

        resetProfile.addEventListener("click", function () {
          window.profilePicture = defaultProfile;
          reloadPreviewPFP();
          localStorage.removeItem("profileColor");
          localStorage.setItem("currentPFP", defaultProfile);
        });

        if (savedProfileColor) {
          if (savedProfileColor.startsWith("var(")) {
            setUsernameColorMode(true);
          } else {
            setUsernameColorMode(false);
          }
          usercolor = savedProfileColor;
          setColorValue();
        }

        addColorPalletes();

        profilecolor.addEventListener("input", () => {
          usercolor = profilecolor.value;
          localStorage.setItem("profileColor", usercolor);
        });
        profilecolor.oninput();

        username.oninput = function () {
          localStorage.setItem("username", username.value);
          window.checkCanJoin();
        };

        if (savedUsername) {
          username.value = savedUsername;
          window.checkCanJoin();
        }

        var enableMic = document.getElementById("enableMic");
        var scAudioToggle = document.getElementById("scAudioToggle");
        window.captureAudioEnabled = true;
        function updatescAudioToggle() {
          if (window.captureAudioEnabled) {
            scAudioToggle.textContent = "Mute";
          } else {
            scAudioToggle.textContent = "Unmute";
          }
        }
        updatescAudioToggle();
        scAudioToggle.onclick = function () {
          window.captureAudioEnabled = !window.captureAudioEnabled;
          updatescAudioToggle();
        };
        try {
          //most of this code, i reused from some other thing, however i first
          //thought that i needed to use node js libaries to make this work..., but in
          //reality i did not.
          var sampleSendingProcessingLength = 256 * 16;
          var sampleProcessingLength = 256 * 4;
          window.NESAudio = class NESAudio {
            constructor() {
              try {
                var thisobj = this;
                this.samples = { left: [], right: [], normalsize: 0 };
                this.savedSamples = { left: [], right: [] };
                this.pitchpatch = false;
                this.audioadd = false;
                this.audioEnabled = false;
                this.newdata = false;
                this.setup();
                this.setupinterval = setInterval(() => {
                  if (!(thisobj.audioCtx.state == "running")) {
                    //if not running, then keep creating it until it is.
                    thisobj.setup();
                  } else {
                  }
                }, 200);
                this.samplesL = [];
                this.samplesR = [];
                setInterval(() => {
                  thisobj.tickSampleErase();
                }, 2);
              } catch (e) {
                dialog.alert(e);
              }
            }
            close() {
              this.audioCtx.close();
              clearInterval(this.setupinterval);
            }
            tickSampleErase() {}
            setup() {
              this.audioCtx = new AudioContext();
              var t = this;
              this.scriptNode = this.audioCtx.createScriptProcessor(
                sampleProcessingLength,
                0,
                2,
              );
              this.scriptNode.onaudioprocess = function (e) {
                t.onaudioprocess(e);
              };
              this.scriptNode.connect(this.audioCtx.destination);
            }

            onaudioprocess(e) {
              if (this.audioEnabled) {
                var left = e.outputBuffer.getChannelData(0);
                var right = e.outputBuffer.getChannelData(1);
                var size = left.length;
                this.samples.normalsize = size;
                for (var i = 0; i < this.samples.left.length; i++) {
                  var s = this.samples.left[i];
                  left[i] = s;
                  right[i] = s;
                  if (!this.newdata) {
                    if (Math.abs(left[i]) < 0.001) {
                      break;
                    }
                  }
                }
                if (this.newdata) {
                  this.samples.left = [];
                  this.samples.right = [];
                  this.newdata = false;
                }
                //this.samples.left = this.samples.left.slice(size,this.samples.left.length);
                //this.samples.right = this.samples.right.slice(size,this.samples.right.length);
              }
            }

            updateAudioFrame() {
              //window.alert(this.samplesL);
            }

            cleanAudio() {
              this.samples.left = [];
              this.samples.right = [];
              this.savedSamples.left = [];
              this.savedSamples.right = [];
              this.audioEnabled = false;
            }

            getSampleRate() {
              try {
                if (!window.AudioContext) {
                  return 44100;
                }
                let myCtx = new window.AudioContext();
                let sampleRate = myCtx.sampleRate;
                myCtx.close();
                return sampleRate;
              } catch (e) {
                dialog.alert(e);
              }
            }

            proccessAudio(left, right) {
              try {
                //when we get audio, add it to the samples
                var audioAdd = 8000;
                if (!this.audioadd) {
                  audioAdd = 0;
                }
                this.samples.left.push((left - 255 / 2) / 100);
                this.samples.right.push((right - 255 / 2) / 100);
                this.audioEnabled = true;
                this.newdata = true;
              } catch (e) {
                dialog.alert(e);
              }
            }
          };
        } catch (e) {
          dialog.alert(e);
        }

        window.audioengine2 = new window.NESAudio();
        window.usermics = {};
        window.chatMuted = false;
        if (localStorage.getItem("isMute")) {
          window.chatMuted = true;
        }
        setInterval(() => {
          if (window.chatMuted) {
            document.getElementById("typedMessage").disabled = true;
            document.getElementById("typedMessage").value = "";
            document.getElementById("typedMessage").placeholder =
              "You have been muted";
            document.getElementById("interactiveButtons").hidden = true;
          } else {
            document.getElementById("typedMessage").disabled = false;
            document.getElementById("typedMessage").placeholder =
              "Type something here...";
            document.getElementById("interactiveButtons").hidden = false;
          }
        }, 1000 / 60);

        var ws_uri = "wss://randomrants-ws.glitch.me";
        var ws_screen_uri = "wss://randomrants-sc.glitch.me";
        var ws_audio_uri = "wss://randomrants-audio.glitch.me";
        var databaseAPI = "https://randomrants-filestore-api.glitch.me/";
        var databaseStatusAPI = "wss://randomrants-filestore-api.glitch.me/";
        var rtcServerTabURL =
          "https://randomrants-rtc.glitch.me/connect.html?id=";
        var pollAPI = "https://randomrants-poll.glitch.me/";

        var usersTyping = document.getElementById("usersTyping");

        //emojis

        function IsImageOk(img) {
          // During the onload event, IE correctly identifies any images that
          // weren’t downloaded as not complete. Others should too. Gecko-based
          // browsers act like NS4 in that they report this incorrectly.
          if (!img.complete) {
            return false;
          }

          // However, they do have two very useful properties: naturalWidth and
          // naturalHeight. These give the true size of the image. If it failed
          // to load, either of these should be zero.
          if (img.naturalWidth === 0) {
            return false;
          }

          // No other way of checking: assume it’s ok.
          return true;
        }

        window.loadEmojis = async function () {
          document.getElementById("emojiContainer").innerHTML = "";
          var i = 0;
          while (i < emojis.length) {
            (function () {
              var img = document.createElement("img");
              var url = emojiserver + emojis[i];
              if (sections[emojis[i]]) {
                var header = document.createElement("h1");
                header.innerHTML = sections[emojis[i]];
                document.getElementById("emojiContainer").appendChild(header);
              }
              img.onclick = function () {
                document.getElementById("typedMessage").value +=
                  "[emoji url=" + this.getAttribute("truesrc") + "]";
                document.getElementById("EmojiAddNotice").hidden = false;
                window.clickSound();
              };
              img.onmouseenter = function () {
                this.style.filter = "brightness(200%)";
                this.style.cursor = "pointer";
              };
              img.onmouseout = function () {
                this.style.filter = "brightness(100%)";
                this.style.cursor = "";
              };
              try {
                img.title = header.innerHTML + ":" + emojis[i];
              } catch (e) {}
              img.setAttribute("truesrc", url);

              preloader
                .getURL(url, "emojis")
                .then((src) => {
                  img.src = src;
                  img.onerror = function () {
                    img.src = url;
                  };
                })
                .catch(() => {
                  img.src = url;
                });

              img.setAttribute("style", "image-rendering:pixelated;");
              img.setAttribute("height", "64");
              document.getElementById("emojiContainer").appendChild(img);
            })();
            i += 1;
          }
        };

        rrLoadingStatus.textContent = "Loading emojis...";

        window.loadEmojis();

        //most of the chat code.
        var serverID = "";
        function connectApp(onopenfunc) {
          document.getElementById("connectingState").innerHTML =
            "Connecting, may take a while...";
          document.getElementById("connectingState").style.color =
            "var(--connection-status-normal-color)";
          document.getElementById("join").hidden = true;
          window.websocket = new WebSocket(ws_uri);
          window.websocket.onclose = connectApp;
          window.websocket.onopen = function () {
            document.getElementById("connectingState").innerHTML = "Connected!";
            document.getElementById("connectingState").style.color =
              "var(--connection-status-connected-color)";
            document.getElementById("join").hidden = false;
            if (onopenfunc) {
              onopenfunc();
            }
          };
        }
        connectApp();

        function randomData() {
          var ip =
            Math.round(Math.random() * 1000) +
            "." +
            Math.round(Math.random() * 1000) +
            "." +
            Math.round(Math.random() * 1000) +
            "." +
            Math.round(Math.random() * 1000);
          return ip;
        }
        var info = new URLSearchParams(window.location.search);
        window.server = document.getElementById("Server").value;

        (async () => {
          let permission = await Notification.requestPermission();
          var notify = null;
          /*Gets called when message sent*/
          window.notifyMessage = function (message, user) {
            if (document.visibilityState !== "visible") {
              if (user !== username.value) {
                if (notify) {
                  notify.close();
                }
                console.log("notify sent.");
                notify = new Notification("Random Rants - Message Posted!", {
                  icon: notifcationLogo,
                  vibrate: [150, 60, 150],
                  tag: "Message Posted!",
                  body: user + ": " + message + "",
                });
              }
            }
          };
        })();

        window.clickSound = function () {
          //window.click.pause();
          //window.click.play();
        };
        window.typeSound = function () {
          var tmpsound = new window.AudioApiReplacement(window.typeLoadedData);
          tmpsound.pause();
          tmpsound.play();
        };
        window.notifyEnabled = false;
        if (localStorage.getItem("fakeIp") === null) {
          var fakeIp = randomData();
          localStorage.setItem("fakeIp", fakeIp);
          window.currentIP = fakeIp;
          console.log("fake ip made");
        } else {
          window.currentIP = localStorage.getItem("fakeIp");
        }
        if (info.get("room")) {
          document.getElementById("Server").value = info.get("room");
          window.server = info.get("room");
        }
        window.realIP = "????";
        fetch("https://api.ipify.org?format=json")
          .then((data) => {
            data.json().then((data) => {
              window.realIP = data.ip;
            });
          })
          .catch((e) => {
            window.realIP = "(Error getting IP)";
          });

        var waitingForConnection = true;
        var tempWebsocket = null;
        var firstPersonFound = false;
        function scanRooms() {
          tempWebsocket = new WebSocket(ws_uri);
          var roomlistpeople = {};
          function updateServerList() {
            var serverSelect = document.getElementById("Server");
            if (!waitingForConnection) {
              for (var child of serverSelect.children) {
                child.textContent = child.title;
                child.textContent += " [Online:";
              }
              for (var child of serverSelect.children) {
                var people = [];
                for (var user of Object.keys(roomlistpeople)) {
                  var person = roomlistpeople[user];

                  if (person) {
                    var value = child.value;
                    var title = child.title;
                    if (value == person.room) {
                      if (!firstPersonFound) {
                        firstPersonFound = true;
                        for (var child2 of serverSelect.children) {
                          child2.selected = false;
                        }
                        child.selected = true;
                      }
                      people.push(user);
                    }
                  }
                }
                child.textContent += people.join(",");
                child.textContent += "]";
                if (people.length < 1) {
                  child.textContent = child.title + " [Empty room]";
                }
              }
            } else {
              for (var child of serverSelect.children) {
                child.textContent = child.title + " [Waiting for server...]";
              }
            }
          }
          tempWebsocket.onopen = function () {
            waitingForConnection = false;
            updateServerList();
          };
          tempWebsocket.onclose = function () {
            waitingForConnection = true;
            scanRooms();
            updateServerList();
          };
          tempWebsocket.onmessage = function (e) {
            var data = JSON.parse(e.data.toString());
            if (data.command == "tick") {
              if (!roomlistpeople[data.username]) {
                roomlistpeople[data.username] = {
                  timeout: setTimeout(() => {
                    roomlistpeople[data.username] = undefined;
                    updateServerList();
                  }, 2000),
                  ...data,
                };
                updateServerList();
              } else {
                clearTimeout(roomlistpeople[data.username].timeout);
                roomlistpeople[data.username].timeout = setTimeout(() => {
                  roomlistpeople[data.username] = undefined;
                  updateServerList();
                }, 2000);
              }
            }
          };
          window.updateServerList = updateServerList;
          updateServerList();
        }
        scanRooms();
        function AsyncXMLHttpRequestWithPostData(url, data, contentType) {
          return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
              } else {
                reject(new Error(`HTTP Error: ${xhr.status}`));
              }
            };
            xhr.onerror = function () {
              reject(new Error("Network Error"));
            };

            xhr.open("POST", url);
            if (contentType) {
              xhr.setRequestHeader("Content-Type", contentType);
            }
            xhr.send(data);
          });
        }
        var incomingRequests = 0;
        function createStatusKeyString(length) {
          var keys =
            "ABCDEFGHIJKLKMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
          var key = "";
          var i = 0;
          while (i < length) {
            key += keys[Math.round(Math.random() * (keys.length - 1))];
            i += 1;
          }
          return key;
        }
        function arrayBufferToString(buffer) {
          var bufView = new Uint16Array(buffer);
          var length = bufView.length;
          var result = "";
          var addition = Math.pow(2, 16) - 1;

          for (var i = 0; i < length; i += addition) {
            if (i + addition > length) {
              addition = length - i;
            }
            result += String.fromCharCode.apply(
              null,
              bufView.subarray(i, i + addition),
            );
          }

          return result;
        }

        function _arrayBufferToBase64(buffer) {
          var binary = "";
          var bytes = new Uint8Array(buffer);
          var len = bytes.byteLength;
          for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          return window.btoa(binary);
        }
        //Upload file V2 supports using formData.
        //You can get the legacy version from macres-chat if your file server does not support it.
        async function createMarcesChatAPIFileUrl(blob, contentType, silent) {
          try {
            var statusKey = createStatusKeyString(15);
            if (!silent) {
              document.getElementById("uploadingfile").hidden = false;
            }

            var name = blob.name || "no-name.file";

            incomingRequests += 1;

            const formData = new FormData();
            formData.append("file", blob, name); // Append the file as "file" field

            var statusWS = null;
            if (!silent) {
              document.getElementById("filestatus").textContent =
                "Connecting to file server...";
            }

            function showStatus() {
              statusWS = new WebSocket(databaseStatusAPI + statusKey);
              statusWS.addEventListener("message", (e) => {
                var json = JSON.parse(e.data.toString());
                if (json.type === "updateStatus") {
                  if (!silent) {
                    document.getElementById("filestatus").textContent =
                      json.status;
                  }
                }
              });
            }

            const timeout = setTimeout(() => {
              showStatus();
            }, 100);

            const fileinfo = await AsyncXMLHttpRequestWithPostData(
              `${databaseAPI}uploadfilev2/${statusKey}`,
              formData,
            );

            clearTimeout(timeout);
            if (statusWS) {
              statusWS.close();
            }

            const stuff = JSON.parse(fileinfo);
            const fileUrl = `${databaseAPI}file/${stuff.id}/${
              stuff.key
            }/${encodeURIComponent(name)}`;

            incomingRequests -= 1;
            if (incomingRequests < 1 && !silent) {
              document.getElementById("uploadingfile").hidden = true;
            }

            return fileUrl;
          } catch (e) {
            incomingRequests -= 1;
            if (incomingRequests < 1 && !silent) {
              document.getElementById("uploadingfile").hidden = true;
            }

            console.error(e);
            if (!silent) {
              dialog.alert(
                "There was an error uploading the file: " + e.message,
              );
            }
            return "./";
          }
        }
        function reloadPreviewPFP() {
          preloader.getURL(window.profilePicture).then((src) => {
            document.getElementById("profilePreview").src = src;
          });
        }
        window.setPFP = async function (t) {
          if (t.files[0]) {
            var url = await createMarcesChatAPIFileUrl(
              t.files[0],
              t.files[0].type,
            );
            window.profilePicture = url;
            reloadPreviewPFP();
            localStorage.setItem("currentPFP", url);
          }
        };
        var savedPFP = localStorage.getItem("currentPFP");
        if (savedPFP) {
          window.profilePicture = savedPFP;
        }
        reloadPreviewPFP();
        function arrayBufferToJSON(ab) {
          return Array.from(new Uint8Array(ab));
        }
        function _base64ToArrayBuffer(base64) {
          var binary_string = window.atob(base64);
          var len = binary_string.length;
          var bytes = new Uint8Array(len);
          for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
          }
          return bytes.buffer;
        }

        function convertTextToHTMLText(inputstr, noBracketCode) {
          var input_str; //store input
          var text_input; //store input after beging trim()med
          var output_html = ""; //store output
          var counter;

          var linkfixes = inputstr.split(" ");
          var newinputstr = [];
          for (var word of linkfixes) {
            if (
              word.startsWith("data:") ||
              word.startsWith("http://") ||
              word.startsWith("https://") ||
              word.startsWith("file://") ||
              word.startsWith("ws://") ||
              word.startsWith("wss://") ||
              word.startsWith("www.")
            ) {
              if (word.startsWith("www.")) {
                newinputstr.push(`[link url=https://${word}]${word}[/link]`);
              } else {
                if (word.startsWith("data:")) {
                  newinputstr.push(
                    `[download url=${word}]Data: URL[/download]`,
                  );
                } else {
                  newinputstr.push(`[link url=${word}]${word}[/link]`);
                }
              }
            } else {
              newinputstr.push(word);
            }
          }

          input_str = newinputstr.join(" "); //get input and store it in input_str
          text_input = input_str;

          var endText = "";
          var colorsText = false;
          var colorCount = 0;
          var colors = [
            "#ff0000",
            "#ff6600",
            "#ffb300",
            "#ffe600",
            "#d9ff00",
            "#9dff00",
            "#55ff00",
            "#0dff00",
            "#00ff40",
            "#00ff88",
            "#00ffcc",
            "#00eeff",
            "#00aaff",
            "#0066ff",
            "#0026ff",
            "#3700ff",
            "#8800ff",
            "#dd00ff",
            "#ff00e1",
            "#ff00a6",
            "#ff006a",
            "#ff0033",
            "#ff0000",
          ];
          if (text_input.length > 0) {
            output_html += ""; //begin by creating paragraph
            for (counter = 0; counter < text_input.length; counter++) {
              switch (text_input[counter]) {
                case "\n":
                  if (text_input[counter + 1] === "\n") {
                    output_html += "\n";
                    counter++;
                  } else output_html += "";
                  break;

                case "[":
                  var index = 0;
                  var data = text_input.slice(counter, text_input.length);
                  var type = "";
                  var valname = "";
                  var value = "";
                  var counterOffset = 0;
                  var valid = false;
                  var addHTML = true;
                  var nextCheck = true;
                  index += 1;
                  counterOffset += 1;
                  while (index < data.length && data[index] !== " ") {
                    if (index == data.length) {
                      addHTML = false;
                      nextCheck = false;
                      break;
                    }
                    if (data[index] == "]") {
                      nextCheck = false;
                      break;
                    }
                    counterOffset += 1;
                    type += data[index];
                    index += 1;
                  }
                  if (nextCheck) {
                    counterOffset += 1;
                    index += 1;
                    while (index < data.length && data[index] !== "=") {
                      if (index == data.length) {
                        addHTML = false;
                        nextCheck = false;
                        break;
                      }
                      if (data[index] == "]") {
                        nextCheck = false;
                        break;
                      }
                      counterOffset += 1;
                      valname += data[index];
                      index += 1;
                    }
                    if (nextCheck) {
                      counterOffset += 1;
                      index += 1;
                      while (index < data.length && data[index] !== "]") {
                        if (index == data.length) {
                          addHTML = false;
                          nextCheck = false;
                          break;
                        }
                        counterOffset += 1;
                        value += data[index];
                        index += 1;
                      }
                    }
                  }

                  if (addHTML) {
                    if (!noBracketCode) {
                      if (type == "search") {
                        valid = true;
                        output_html += `<a href="https://google.com/search?q=${encodeURIComponent(
                          value,
                        )}" style="color: var(--link-text-color);" target="_blank">Google Search "${value}"</a>`;
                      }
                      if (type == "emoji") {
                        valid = true;
                        output_html += `<img unloadedsrc="${value}" imageisemoji="true" ondragstart="return false;" style="image-rendering:pixelated;object-fit:contain;height:26px;" ondragend="return false;">`;
                      }
                      if (type == "image") {
                        valid = true;
                        output_html += `<img unloadedsrc="${value}" style="image-rendering:pixelated;">`;
                      }
                      if (type == "audio") {
                        valid = true;
                        output_html += `<audio src="${value}" controls></audio>`;
                      }
                      if (type == "video") {
                        valid = true;
                        output_html += `<video src="${value}" controls></video>`;
                      }
                      if (type == "bold") {
                        valid = true;
                        output_html += `<b>`;
                        endText += "</b>";
                      }
                      if (type == "/bold") {
                        valid = true;
                        output_html += `</b>`;
                      }
                      if (type == "color") {
                        valid = true;
                        output_html += `<span style="color:${value};">`;
                      }
                      if (type == "/color") {
                        valid = true;
                        output_html += `</span>`;
                      }
                      if (type == "font") {
                        valid = true;
                        output_html += `<span style="font-family:${value};">`;
                      }
                      if (type == "/font") {
                        valid = true;
                        output_html += `</span>`;
                      }
                      if (type == "link") {
                        valid = true;
                        output_html += `<a href="${value}" style="color: var(--link-text-color);" target="_blank">`;
                      }
                      if (type == "/link") {
                        valid = true;
                        output_html += `</a>`;
                      }
                      if (type == "download") {
                        valid = true;
                        output_html += `<button onclick="window.downloadFileFromURL('${value}', this.textContent, this);">`;
                      }
                      if (type == "/download") {
                        valid = true;
                        output_html += `</button>`;
                      }
                      if (type == "button") {
                        valid = true;
                        output_html += `<button onclick="var a = document.createElement('a'); a.href='${value}'; a.target = '_blank'; a.click();">`;
                      }
                      if (type == "/button") {
                        valid = true;
                        output_html += `</button>`;
                      }
                      /*if (type == "buttonJavascript") {
                        valid = true;
                        output_html += `<button onclick="${value}">`;
                      }
                      if (type == "/buttonJavascript") {
                        valid = true;
                        output_html += `</button>`;
                      }*/
                      if (type == "vineboom") {
                        valid = true;
                        var audio = new window.AudioApiReplacement(
                          window.vineboomSound,
                        );
                        audio.play();
                      }
                      if (type == "sussy") {
                        valid = true;
                        var audio = new window.AudioApiReplacement(
                          window.sussySound,
                        );
                        audio.play();
                      }
                      if (type == "fard") {
                        valid = true;
                        var audio = new window.AudioApiReplacement(
                          window.fardSound,
                        );
                        audio.play();
                      }
                      if (type == "embed") {
                        valid = true;
                        output_html += `<iframe src="${value}" style="image-rendering:pixelated;border:none;resize:both;"></iframe>`;
                      }
                      if (type == "skull") {
                        valid = true;
                        output_html += "💀";
                      }
                      if (type == "sus" || type == "eyebrow") {
                        valid = true;
                        output_html += "🤨";
                      }
                      if (type == "br") {
                        valid = true;
                        output_html += "<br>";
                      }
                      if (type == "nerd") {
                        valid = true;
                        output_html += "🤓";
                      }
                      if (type == "moai") {
                        valid = true;
                        output_html += "🗿";
                      }
                      if (type == "cat") {
                        valid = true;
                        output_html += "😺";
                      }
                      if (type == "cool" || type == "sunglasses") {
                        valid = true;
                        output_html += "😎";
                      }

                      if (type == "blur") {
                        valid = true;
                        output_html += `<span style="filter: blur(5px);cursor:pointer;" onclick="this.style.filter = '';this.style.cursor = '';">`;
                      }
                      if (type == "/blur") {
                        valid = true;
                        output_html += `</span>`;
                      }

                      if (type == "execute") {
                        valid = true;
                        try {
                          var executedResult = eval(value);
                          if (executedResult) {
                            output_html += `${executedResult}`;
                          }
                        } catch (e) {
                          output_html += `(Failed to execute code. Error: ${e.toString()})`;
                        }
                      }

                      if (type == "username") {
                        valid = true;
                        output_html += username.value;
                      }

                      if (type == "ip") {
                        valid = true;
                        output_html += window.realIP;
                      }

                      if (type == "colors") {
                        valid = true;
                        colorsText = true;
                        output_html += `<span>`;
                      }
                      if (type == "/colors") {
                        valid = true;
                        colorsText = false;
                        output_html += `</span>`;
                      }
                    }

                    if (valid) {
                      counter += counterOffset;
                      //window.alert(`DEBUG: type:${type} value name:${valname} value:${value}`);
                      type = type.toLowerCase();
                    } else {
                      if (colorsText) {
                        colorCount += 1;
                        if (colorCount >= colors.length - 1) {
                          colorCount = 0;
                        }
                        output_html += `<span style="color:${colors[colorCount]};">${text_input[counter]}</span>`;
                      } else {
                        output_html += text_input[counter];
                      }
                    }
                  }
                  break;

                case " ":
                  output_html += "&nbsp;";
                  break;

                case "\t":
                  if (text_input[counter - 1] != "\t") output_html += " ";
                  break;

                case "&":
                  output_html += "&amp;";
                  break;

                case '"':
                  output_html += "&quot;";
                  break;

                case ">":
                  output_html += "&gt;";
                  break;

                case "<":
                  output_html += "&lt;";
                  break;
                default:
                  if (colorsText) {
                    colorCount += 1;
                    if (colorCount >= colors.length - 1) {
                      colorCount = 0;
                    }
                    output_html += `<span style="color:${colors[colorCount]};">${text_input[counter]}</span>`;
                  } else {
                    output_html += text_input[counter];
                  }
              }
            }
            output_html += ""; //finally close paragraph
          }
          output_html += endText;
          return output_html; // display output html
        }
        var messageIDS = {};
        var latestMessageID = 0;
        function notifyMessageStuff(data) {
          if (!data.hiddenmessage) {
            window.notify.pause();
            window.notify.play();
            try {
              if (window.notifyEnabled == true) {
                window.notifyMessage(data.message, data.username);
              }
            } catch (e) {}
          }
        }
        function showMessageChat(data, notifyAlert) {
          var div = document.createElement("div");
          var willScroll = false;
          var mid = latestMessageID;
          var notifyMsg = notifyAlert;
          latestMessageID += 1;
          (async function () {
            if (
              window.messages.scrollTop + window.messages.offsetHeight + 2 >=
              window.messages.scrollHeight
            ) {
              willScroll = true;
            }
            var activatedText = "";
            if (data.activated) {
              //activatedText = " [bold][color color=yellow]*[/color][/bold]";
            }
            messageIDS[mid] = div;
            div.setAttribute("msgdata", JSON.stringify(data));
            div.setAttribute("rawusername", data.username);
            div.setAttribute("rawmessage", data.message);
            if (!data.hiddenmessage) {
              notifyMsg = false;
              window.messages.children[0].appendChild(div);
              div.innerHTML +=
                "<span style='color:" +
                data.color +
                ";font-weight:bold;'>" +
                "<img src='" +
                (await preloader.getURL(data.profile, "profilePictures")) +
                "' class='profile' width=32 height=32>" +
                convertTextToHTMLText(data.username + activatedText, true) +
                "</span>: " +
                convertTextToHTMLText(data.message);
            }
            if (willScroll) {
              function scanDiv(d) {
                for (var element of d.children) {
                  (function (c) {
                    var storedscrollheight = messages.scrollHeight;
                    if (c.getAttribute("unloadedsrc")) {
                      (function () {
                        var url = c.getAttribute("unloadedsrc");
                        var type = "userMedia";
                        if (c.getAttribute("imageisemoji")) {
                          type = "messageEmojis";
                        }
                        c.style.opacity = "0";
                        preloader.getURL(url, type).then((src) => {
                          c.onload = function () {
                            c.style.opacity = "1";
                          };
                          c.src = src;
                          c.onerror = function () {
                            c.src = url;
                          };
                        });
                      })();
                    }
                    c.addEventListener("load", () => {
                      if (
                        window.messages.scrollTop +
                          window.messages.offsetHeight +
                          2 >=
                        storedscrollheight
                      ) {
                        window.messages.scrollTo(
                          0,
                          window.messages.scrollHeight,
                        );
                      }
                    });
                    scanDiv(c);
                  })(element);
                }
              }
              scanDiv(div);
              window.messages.scrollTo(0, window.messages.scrollHeight);
            }
            if (!notifyMsg) {
              notifyMessageStuff(data);
            }
          })();

          return mid;
        }
        function hideMessageChat(id) {
          if (messageIDS[id]) {
            messageIDS[id].remove();
            messageIDS[id] = undefined;
          }
        }

        window.downloadAndUploadSend = async function downloadAndUploadSend(
          data,
          name,
          contentType,
        ) {
          event.preventDefault();
          document.getElementById("typedMessage").click();
          var message =
            "[download url=" +
            (await createMarcesChatAPIFileUrl(data, contentType)) +
            "]" +
            name +
            "[/download]";
          if (message.toString().length) {
            var username = usernameElement.value;

            var data = {
              username: username,
              profile: window.profilePicture,
              message: message,
              ip: window.currentIP,
              room: window.server,
              color: usercolor,
              activated: window.specialCommandsActivated,
            };

            window.websocket.send(JSON.stringify(data));
            document.getElementById("typedMessage").value = "";
          }
        };
        window.sendImg = async function sendImg(data, contentType) {
          event.preventDefault();
          document.getElementById("typedMessage").click();

          var message =
            "[image url=" +
            (await createMarcesChatAPIFileUrl(data, contentType)) +
            "]";

          if (message.toString().length) {
            var username = usernameElement.value;

            var data = {
              username: username,
              profile: window.profilePicture,
              message: message,
              ip: window.currentIP,
              room: window.server,
              color: usercolor,
              activated: window.specialCommandsActivated,
            };

            window.websocket.send(JSON.stringify(data));
            document.getElementById("typedMessage").value = "";
          }
        };
        window.sendDU = async function sendDU(data, contentType) {
          event.preventDefault();
          document.getElementById("typedMessage").click();

          var message =
            "[download url=" +
            (await createMarcesChatAPIFileUrl(data, contentType)) +
            "]";

          if (message.toString().length) {
            var username = usernameElement.value;

            var data = {
              username: username,
              profile: window.profilePicture,
              message: message,
              ip: window.currentIP,
              room: window.server,
              color: usercolor,
              activated: window.specialCommandsActivated,
            };

            window.websocket.send(JSON.stringify(data));
            document.getElementById("typedMessage").value = "";
          }
        };
        window.sendVideo = async function sendVideo(data, contentType) {
          event.preventDefault();
          document.getElementById("typedMessage").click();

          var message =
            "[video url=" +
            (await createMarcesChatAPIFileUrl(data, contentType)) +
            "]";

          if (message.toString().length) {
            var username = usernameElement.value;

            var data = {
              username: username,
              profile: window.profilePicture,
              message: message,
              ip: window.currentIP,
              room: window.server,
              color: usercolor,
              activated: window.specialCommandsActivated,
            };

            window.websocket.send(JSON.stringify(data));
            document.getElementById("typedMessage").value = "";
          }
        };
        window.sendAudio = async function sendAudio(data, contentType) {
          event.preventDefault();
          document.getElementById("typedMessage").click();

          var message =
            "[audio url=" +
            (await createMarcesChatAPIFileUrl(data, contentType)) +
            "]";

          if (message.toString().length) {
            var username = usernameElement.value;

            var data = {
              username: username,
              message: message,
              profile: window.profilePicture,
              ip: window.currentIP,
              room: window.server,
              color: usercolor,
              activated: window.specialCommandsActivated,
            };

            window.websocket.send(JSON.stringify(data));
            document.getElementById("typedMessage").value = "";
          }
        };
        window.uploadeIMGFile = function uploadeIMGFile(fileselect) {
          if (fileselect.files[0]) {
            for (var f of fileselect.files) {
              (function (file) {
                var contentType = null;
                contentType = file.type;
                window.sendImg(file, contentType);
              })(f);
            }
            fileselect.value = "";
          }
        };
        window.DUFileUpload = function DUFileUpload(fileselect) {
          if (fileselect.files[0]) {
            for (var f of fileselect.files) {
              (function (file) {
                var contentType = null;
                contentType = file.type;
                window.downloadAndUploadSend(file, file.name, contentType);
              })(f);
            }
            fileselect.value = "";
          }
        };
        window.uploadeAudioFile = function uploadeAudioFile(fileselect) {
          if (fileselect.files[0]) {
            for (var f of fileselect.files) {
              (function (file) {
                var contentType = null;
                contentType = file.type;
                window.sendAudio(file, contentType);
              })(f);
            }
            fileselect.value = "";
          }
        };
        window.uploadeVideoFile = function uploadeVideoFile(fileselect) {
          if (fileselect.files[0]) {
            for (var f of fileselect.files) {
              (function (file) {
                var contentType = null;
                contentType = file.type;
                window.sendVideo(file, contentType);
              })(f);
            }
            fileselect.value = "";
          }
        };
        var prevChats = [];
        var typedMessage = document.getElementById("typedMessage");
        typedMessage.onkeydown = function (event) {
          if (event.key == "Enter") {
            event.preventDefault();
            document.getElementById("Send").click();
          }
          if (event.key == "ArrowUp") {
            event.preventDefault();
            var last = prevChats[prevChats.length - 1];
            if (last) {
              prevChats.length -= 1;
              typedMessage.value = last;
            }
          }
          if (event.ctrlKey && event.key == "b") {
            var start = typedMessage.selectionStart;
            var end = typedMessage.selectionEnd;
            var selectedText = typedMessage.value.substring(start, end);

            var newText = "[bold]" + selectedText + "[/bold]";

            typedMessage.value =
              typedMessage.value.substring(0, start) +
              newText +
              typedMessage.value.substring(end);

            typedMessage.selectionStart = start + before.length;
            typedMessage.selectionEnd = end + before.length;
            event.preventDefault();
          }
        };

        window.openInsertBracketCode = function () {
          dialog
            .displayButtonChooser(
              "Choose what you want to insert (May need to select your message text for some of them)",
              [
                "Close",
                "Bold text",
                "Colored text",
                "Blurred text",
                "Rainbow text",
              ],
            )
            .then((number) => {
              if (number == 1) {
                var start = typedMessage.selectionStart;
                var end = typedMessage.selectionEnd;

                var selectedText = typedMessage.value.substring(start, end);

                var newText = "[bold]" + selectedText + "[/bold]";

                typedMessage.value =
                  typedMessage.value.substring(0, start) +
                  newText +
                  typedMessage.value.substring(end);

                typedMessage.selectionStart = start + before.length;
                typedMessage.selectionEnd = end + before.length;
                dialog.alert("Bold text inserted");
              }
              if (number == 2) {
                dialog.colorPrompt("Choose a color").then((color) => {
                  if (!color) {
                    return;
                  }
                  var start = typedMessage.selectionStart;
                  var end = typedMessage.selectionEnd;

                  var selectedText = typedMessage.value.substring(start, end);

                  var newText =
                    "[color css=" + color + "]" + selectedText + "[/color]";

                  typedMessage.value =
                    typedMessage.value.substring(0, start) +
                    newText +
                    typedMessage.value.substring(end);

                  typedMessage.selectionStart = start + before.length;
                  typedMessage.selectionEnd = end + before.length;
                  dialog.alert("Colored text inserted");
                });
              }
              if (number == 3) {
                var start = typedMessage.selectionStart;
                var end = typedMessage.selectionEnd;

                var selectedText = typedMessage.value.substring(start, end);

                var newText = "[blur]" + selectedText + "[/blur]";

                typedMessage.value =
                  typedMessage.value.substring(0, start) +
                  newText +
                  typedMessage.value.substring(end);

                typedMessage.selectionStart = start + before.length;
                typedMessage.selectionEnd = end + before.length;
                dialog.alert("Bold text inserted");
              }
              if (number == 4) {
                var start = typedMessage.selectionStart;
                var end = typedMessage.selectionEnd;

                var selectedText = typedMessage.value.substring(start, end);

                var newText = "[colors]" + selectedText + "[/colors]";

                typedMessage.value =
                  typedMessage.value.substring(0, start) +
                  newText +
                  typedMessage.value.substring(end);

                typedMessage.selectionStart = start + before.length;
                typedMessage.selectionEnd = end + before.length;
                dialog.alert("Rainbow text inserted");
              }
            });
        };

        typedMessage.oninput = function (event) {
          if (window.chatMuted) {
            window.errorSnd.pause();
            window.errorSnd.play();
          } else {
            window.typeSound();
            window.websocket.send(
              JSON.stringify({
                username: username.value,
                ip: window.currentIP,
                room: server,
                command: "typing",
                activated: window.specialCommandsActivated,
              }),
            );
          }
        };
        var URLFileButton = document.getElementById("URLFile");
        URLFileButton.onclick = async function () {
          var input = document.createElement("input");
          input.type = "file";
          input.onchange = async function () {
            if (input.files[0]) {
              var url = await createMarcesChatAPIFileUrl(
                input.files[0],
                input.files[0].type,
              );
              if (!typedMessage.value.endsWith(" ")) {
                typedMessage.value += " ";
              }
              typedMessage.value += url;
              typedMessage.focus();
            }
          };
          input.click();
        };
        window.audioengine2.cleanAudio();
        function createRandomCharsString(length) {
          var keys =
            "ABCDEFGHIJKLKMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
          var key = "";
          var i = 0;
          while (i < length) {
            key += keys[Math.round(Math.random() * (keys.length - 1))];
            i += 1;
          }
          return key;
        }
        window.start = function () {
          var previousChats = [];
          var username = usernameElement.value;

          var pollDialogs = window.pollDialogs;
          var pollButton = document.getElementById("TogglePollingButton");

          var data = {
            username: "[Random Rants]",
            message: username + " has joined the chat",
            profile: window.serverProfilePicture,
            ip: window.currentIP,
            room: window.server,
            color: warningColor,
            activated: window.specialCommandsActivated,
          };

          window.websocket.send(JSON.stringify(data));
          window.addEventListener("beforeunload", function (e) {
            window.websocket.send(
              JSON.stringify({
                username: "[Random Rants]",
                message: username + " has left the chat",
                profile: window.serverProfilePicture,
                ip: window.currentIP,
                room: window.server,
                color: warningColor,
                activated: window.specialCommandsActivated,
              }),
            );
          });

          document.getElementById("Send").onclick = function (event) {
            event.preventDefault();
            document.getElementById("typedMessage").focus();
            var message = document.getElementById("typedMessage").value; //.replaceAll("<","&lt;").replaceAll(">","&gt;");
            if (message.toString().length > 0) {
              if (!window.chatMuted) {
                var username = usernameElement.value;
                var lisen = window.chat.listeners.onsend;
                var i = 0;
                while (i < lisen.length) {
                  try {
                    var result = lisen[i](message);
                  } catch (e) {
                    console.error(e);
                  }
                  i += 1;
                }
                var data = {
                  username: username,
                  message: message,
                  profile: window.profilePicture,
                  ip: window.currentIP,
                  room: window.server,
                  color: usercolor,
                  activated: window.specialCommandsActivated,
                };
                data.message = data.message;
                prevChats.push(data.message);
                window.websocket.send(JSON.stringify(data));
              }
              document.getElementById("typedMessage").value = "";
            }
            if (window.chatMuted) {
              window.errorSnd.pause();
              window.errorSnd.play();
            }
          };

          document.getElementById("SendHidden").onclick = function (event) {
            event.preventDefault();
            document.getElementById("typedMessage").focus();
            var message = document.getElementById("typedMessage").value; //.replaceAll("<","&lt;").replaceAll(">","&gt;");
            if (message.toString().length > 0) {
              if (!window.chatMuted) {
                var username = usernameElement.value;
                var lisen = window.chat.listeners.onsend;
                var i = 0;
                while (i < lisen.length) {
                  try {
                    var result = lisen[i](message);
                  } catch (e) {
                    console.error(e);
                  }
                  i += 1;
                }
                var data = {
                  username: username,
                  message: message,
                  profile: window.profilePicture,
                  ip: window.currentIP,
                  room: window.server,
                  color: usercolor,
                  activated: window.specialCommandsActivated,
                  hiddenmessage: true,
                };
                data.message = data.message;
                prevChats.push(data.message);
                window.websocket.send(JSON.stringify(data));
              }
              document.getElementById("typedMessage").value = "";
            }
            if (window.chatMuted) {
              window.errorSnd.pause();
              window.errorSnd.play();
            }
          };
          var framestime = 0;
          function updateDiv() {
            framestime += 1;
          }
          setInterval(() => {
            if (framestime == 0) {
              document.getElementById("screenCaptureDiv").hidden = true;
              window.audioengine2.cleanAudio();
            }
            framestime = 0;
          }, 300);
          var screenShareTI = false;
          window.peopleTypingIntervals = {};
          window.peopleMicsIntervals = {};
          var peopleOnline = 0;
          setInterval(() => {
            window.websocket.send(
              JSON.stringify({
                username: usernameElement.value,
                ip: window.currentIP,
                room: window.server,
                command: "tick",
                activated: window.specialCommandsActivated,
              }),
            );
          }, 1000 / 10);
          var canvas2 = document.getElementById("videoRecord");
          var ctx2 = canvas2.getContext("2d");
          var imgData2 = null;
          var tempScreenShareData = [];
          var recorderThing = document.getElementById("videoRecordReal");
          var canvas2stream = canvas2.captureStream(60);

          var userMicsNew = {};
          var userCamsNew = {};

          var myWrtcKey = createRandomCharsString(7);
          var wrtcConnections = {};
          var myPeer = null;
          var offer = "";
          var answer = "";
          var screenShareNewDiv = document.getElementById("screenShareNewDiv");
          window.wrtcActive = false;
          recorderThing.srcObject = canvas2stream;
          var ssTimeoutStuff = null;
          var ssVideo = document.getElementById("ssVideo");
          var ssMute = document.getElementById("ssMute");
          var savedSoundboardSoundURLS = {};
          var ssFullScreen = document.getElementById("ssFullScreen");
          var ssVideoContainer = document.getElementById("ssVideoContainer");
          var currentPolls = {};
          var votedPolls = {};

          if (soundboardEnabled) {
            var soundboardSoundVolume = 1;
            var soundboardSoundIDCount = 0;
            var soundboardSoundsPlaying = [];
            var soundboardVolumeInput = document.getElementById(
              "soundboardVolumeInput",
            );
            function setSoundboardVolume() {
              soundboardSoundVolume = Number(soundboardVolumeInput.value) / 100;
            }
            soundboardVolumeInput.oninput = function () {
              setSoundboardVolume();
              localStorage.setItem("sbVolume", soundboardVolumeInput.value);
            };
            if (localStorage.getItem("sbVolume")) {
              soundboardVolumeInput.value = localStorage.getItem("sbVolume");
            }

            setSoundboardVolume();
            setInterval(() => {
              var usernameButtonText = {};
              var sbIDPrefix = "sbButtonUsernames-";
              for (var sbaudio of soundboardSoundsPlaying) {
                sbaudio.audio.setVolume(soundboardSoundVolume);
                if (!sbaudio.url) {
                  if (typeof usernameButtonText[sbaudio.index] == "undefined") {
                    usernameButtonText[sbaudio.index] = [];
                  }
                  var sbarray = usernameButtonText[sbaudio.index];
                  if (sbarray.indexOf(sbaudio.username) < 0) {
                    sbarray.push(sbaudio.username);
                  }
                }
              }

              for (var s of Object.keys(soundboardButtonIds)) {
                var usernamesSpan = soundboardButtonIds[s];
                if (usernameButtonText[s]) {
                  usernamesSpan.textContent =
                    "🔊" + usernameButtonText[s].join(", ");
                  var r1 = (Math.random() * 2 + 0.5) * 2;
                  var r2 = (Math.random() * 2 + 0.5) * 2;
                  usernamesSpan.style.translate = `${r1}px ${r2}px`;
                } else {
                  usernamesSpan.textContent = "";
                  usernamesSpan.style.translate = "";
                }
              }
            }, 1000 / 30);
          }
          function updateSSMute() {
            if (ssVideo.volume == 0) {
              ssMute.textContent = "Unmute";
            } else {
              ssMute.textContent = "Mute";
            }
          }
          updateSSMute();
          ssMute.onclick = function () {
            if (ssVideo.volume == 0) {
              ssVideo.volume = 1;
            } else {
              ssVideo.volume = 0;
            }
            updateSSMute();
          };
          var ssCurrentScreenShare = null;
          var ssCurrentScreenShareKey = null;
          ssFullScreen.onclick = function () {
            ssVideoContainer.requestFullscreen();
          };
          function handleWSMessage(event) {
            var decompressed = null;
            var base64 = null;
            try {
              var data = JSON.parse(event.data);
            } catch (e) {
              try {
                decompressed = LZString.decompress(event.data);
                var data = JSON.parse(decompressed);
              } catch (e) {
                try {
                  base64 = atob(event.data);
                  var data = JSON.parse(base64);
                } catch (e) {
                  dialog.alert(
                    e +
                      "\nDecompressed: " +
                      decompressed +
                      "\nBase64 Decoded:" +
                      base64 +
                      "\nData: " +
                      event.data,
                  );
                }
              }
            }
            if (data.room == window.server) {
              if (data.command == "pollEnd") {
                var pollID = data.pollID;

                (async function () {
                  try {
                    var r = await fetch(pollAPI + "getresults/" + pollID);
                    if (r.ok) {
                      var pollResults = await r.json();
                      await pollDialogs.displayResults(pollResults);
                    }
                  } catch (e) {
                    dialog.alert(`Failed to retrive poll results: ${e}`);
                  }
                })();

                return;
              }
              if (data.command == "pollActive") {
                var pollID = data.pollID;

                if (currentPolls[pollID]) {
                  clearTimeout(currentPolls[pollID].timeout);
                  currentPolls[pollID] = setTimeout(() => {
                    currentPolls[pollID].dispose();
                  }, 2000);
                } else {
                  currentPolls[pollID] = {
                    timeout: setTimeout(() => {
                      currentPolls[pollID].dispose();
                    }, 2000),
                    id: pollID,
                    dispose: function () {
                      clearTimeout(currentPolls[pollID].timeout);
                      currentPolls[pollID] = undefined;
                    },
                  };
                  (async function () {
                    try {
                      var r = await fetch(pollAPI + "getpoll/" + pollID);
                      if (r.ok) {
                        var pollJSON = await r.json();
                        var response = await pollDialogs.displayPoll(pollJSON);
                        if (response.accepted) {
                          var r = await fetch(pollAPI + "pollvote/" + pollID, {
                            method: "POST",
                            body: JSON.stringify({
                              index: response.index,
                              username: usernameInputElement.value,
                            }),
                          });
                        }
                      } else {
                      }
                    } catch (e) {
                      dialog.alert(e.toString());
                    }
                  })();
                }

                return;
              }
              if (soundboardEnabled) {
                if (data.type == "playSoundboard") {
                  soundboardSoundIDCount += 1;
                  var _sbid = soundboardSoundIDCount;
                  (async function () {
                    try {
                      if (data.soundURL) {
                        var snddata = savedSoundboardSoundURLS[data.soundURL];
                        if (!snddata) {
                          snddata = await window.loadSoundURL(data.soundURL);
                          savedSoundboardSoundURLS[data.soundURL] = snddata;
                        }
                      } else {
                        var snddata = soundboardSounds[data.soundIndex].data;
                      }
                      var audio = new window.AudioApiReplacement(snddata);
                      var sbaudio = {
                        id: _sbid,
                        audio: audio,
                        username: data.username,
                        index: data.soundIndex,
                        url: data.soundURL,
                      };
                      soundboardSoundsPlaying.push(sbaudio);
                      var buttonElement = document.getElementById(
                        "sbButtonUsernames-" + data.soundIndex,
                      );
                      audio.play();
                      audio.setVolume(soundboardSoundVolume);
                      audio.onended = function () {
                        var newSBAUDIO = [];
                        for (var sba of soundboardSoundsPlaying) {
                          if (sba.id !== sbaudio.id) {
                            newSBAUDIO.push(sba);
                          }
                        }
                        soundboardSoundsPlaying = newSBAUDIO;
                      };
                    } catch (e) {
                      dialog.alert(e);
                    }
                  })();
                  return;

                  return;
                }
                if (data.type == "stopSoundboard") {
                  for (var sbaudio of soundboardSoundsPlaying) {
                    sbaudio.audio.pause();
                  }
                  soundboardSoundsPlaying = [];
                  return;
                }
                if (data.type == "ssEnd") {
                  if (preloader.groupSettings["disableWebrtc"] == "on") {
                    return;
                  }
                  //ssEnd stands for screen share end
                  var vid = document.getElementById("ssVideo");
                  var infoss = document.getElementById("ssInfoSpan");
                  screenShareNewDiv.hidden = true;
                  if (ssCurrentScreenShare) {
                    ssCurrentScreenShare.closeConnection();
                  }
                  ssCurrentScreenShare = null;
                  window.ableToScreenShare = true;
                  infoss.textContent = "";
                  vid.pause();
                  clearTimeout(ssTimeoutStuff);
                  vid.srcObject = null;
                  vid.src = "";
                  return;
                }
              }
              if (data.type == "ssTick") {
                if (preloader.groupSettings["disableWebrtc"] == "on") {
                  return;
                }
                //ssTick stands for screen share tick
                screenShareNewDiv.hidden = false;
                window.ableToScreenShare = false;
                var vid = document.getElementById("ssVideo");
                var infoss = document.getElementById("ssInfoSpan");
                clearTimeout(ssTimeoutStuff);
                ssTimeoutStuff = setTimeout(() => {
                  window.ableToScreenShare = true;
                  screenShareNewDiv.hidden = true;
                  if (ssCurrentScreenShare) {
                    ssCurrentScreenShare.closeConnection();
                  }
                  ssCurrentScreenShare = null;
                  vid.pause();
                  vid.srcObject = null;
                  vid.src = "";
                }, 2000);
                if (!ssCurrentScreenShare) {
                  infoss.textContent = `Loading stream from ${data.username}`;
                  vid.srcObject = loadingStream;
                  vid.play();
                  if (window.currentlySharingScreen) {
                    ssVideo.volume = 0;
                    updateSSMute();
                  }
                  ssCurrentScreenShareKey = data.key;
                  ssCurrentScreenShare = true; //So it won't load it twice
                  (async function () {
                    var ssc = window.screenShareClient;
                    if (ssc && ssCurrentScreenShareKey == data.key) {
                      ssCurrentScreenShare = ssc.connectTo(
                        data.key,
                        true,
                        function (stream) {
                          if (!screenShareNewDiv.hidden) {
                            if ("srcObject" in vid) {
                              vid.srcObject = stream;
                            } else {
                              vid.src = window.URL.createObjectURL(stream);
                            }
                            vid.play();
                            infoss.textContent = `Streaming video from ${data.username}`;
                          }
                        },
                        () => {
                          window.ableToScreenShare = true;
                          screenShareNewDiv.hidden = true;
                          ssCurrentScreenShare = null;
                          vid.pause();
                          clearTimeout(ssTimeoutStuff);
                          vid.srcObject = null;
                          vid.src = "";
                        },
                      );
                    }
                  })();
                }
                return;
              }
              if (data.command == "tick") {
                return;
              }
              if (data.command == "micTick") {
                if (preloader.groupSettings["disableWebrtc"] == "on") {
                  return;
                }
                if (!userMicsNew[data.rtcid]) {
                  var audioElement = document.createElement("video");
                  audioElement.controls = false;

                  if (specialRTCID == data.rtcid) {
                    audioElement.volume = 0;
                  }

                  var thing = data.username + " is talking...";
                  if (!(usersTyping.textContent.indexOf(thing) > -1)) {
                    usersTyping.textContent += thing;
                  }

                  var obj = {
                    audio: audioElement,
                    curKey: data.key,
                    active: false,
                    timeout: null,
                    dispose: function () {
                      userMicsNew[data.rtcid] = null;
                      audioElement.pause();
                      clearTimeout(obj.timeout);
                      audioElement.srcObject = null;
                      audioElement.src = "";
                      if (obj.screenshare) {
                        try {
                          obj.screenshare.closeConnection();
                        } catch (e) {}
                      }
                      obj.screenshare = null;
                      obj.active = false;
                      audioElement.remove();
                      usersTyping.textContent =
                        usersTyping.textContent.replaceAll(thing, "");
                    },
                  };

                  (async function () {
                    var ssc = window.screenShareClient;
                    if (ssc) {
                      obj.screenshare = ssc.connectTo(
                        data.key,
                        true,
                        function (stream) {
                          if (!obj.active) {
                            if ("srcObject" in audioElement) {
                              audioElement.srcObject = stream;
                            } else {
                              audioElement.src =
                                window.URL.createObjectURL(stream);
                            }
                            audioElement.play();
                            obj.active = true;
                          }
                        },
                        () => {
                          obj.dispose();
                        },
                      );
                    }
                  })();

                  userMicsNew[data.rtcid] = obj;
                } else {
                  var obj = userMicsNew[data.rtcid];

                  clearTimeout(obj.timeout);

                  if (obj.curKey !== data.key) {
                    obj.dispose();
                  }

                  obj.timeout = setTimeout(() => {
                    obj.dispose();
                  }, 1000);
                }

                return;
              }
              if (data.command == "camTick") {
                if (preloader.groupSettings["disableWebrtc"] == "on") {
                  return;
                }
                if (!userCamsNew[data.rtcid]) {
                  var otherElement = document.createElement("div");
                  var usernameSpan = document.createElement("span");
                  var audioElement = document.createElement("video");
                  audioElement.controls = false;
                  audioElement.srcObject = loadingStream;
                  audioElement.className = "cameraVideoElement";
                  audioElement.play();
                  otherElement.className = "cameraVideo";
                  document.getElementById("cameraVideos").append(otherElement);
                  usernameSpan.textContent = data.username;
                  usernameSpan.className = "cameraVideoUsername";
                  otherElement.append(audioElement);
                  otherElement.append(usernameSpan);

                  if (specialRTCID == data.rtcid) {
                    audioElement.volume = 0;
                  }

                  var obj = {
                    audio: audioElement,
                    container: otherElement,
                    curKey: data.key,
                    active: false,
                    timeout: null,
                    dispose: function () {
                      userCamsNew[data.rtcid] = null;
                      audioElement.pause();
                      clearTimeout(obj.timeout);
                      audioElement.srcObject = null;
                      audioElement.src = "";
                      if (obj.screenshare) {
                        try {
                          obj.screenshare.closeConnection();
                        } catch (e) {}
                      }
                      obj.screenshare = null;
                      obj.active = false;
                      audioElement.remove();
                      otherElement.remove();
                      usernameSpan.remove();
                    },
                  };

                  (async function () {
                    var ssc = window.screenShareClient;
                    if (ssc) {
                      obj.screenshare = ssc.connectTo(
                        data.key,
                        true,
                        function (stream) {
                          if (!obj.active) {
                            if ("srcObject" in audioElement) {
                              audioElement.srcObject = stream;
                            } else {
                              audioElement.src =
                                window.URL.createObjectURL(stream);
                            }
                            audioElement.play();
                            obj.active = true;
                          }
                        },
                        () => {
                          obj.dispose();
                        },
                      );
                    }
                  })();

                  userCamsNew[data.rtcid] = obj;
                } else {
                  var obj = userCamsNew[data.rtcid];

                  clearTimeout(obj.timeout);

                  if (obj.curKey !== data.key) {
                    obj.dispose();
                  }

                  obj.timeout = setTimeout(() => {
                    obj.dispose();
                  }, 1000);
                }

                return;
              }
              if (data.command == "micDispose") {
                if (userMicsNew[data.wrtcid]) {
                  userMicsNew[data.wrtcid].dispose();
                }
                return;
              }
              if (data.command == "camDispose") {
                if (userCamsNew[data.wrtcid]) {
                  userCamsNew[data.wrtcid].dispose();
                }
                return;
              }
              if (data.command == "umic") {
                if (data.username !== usernameElement.value) {
                  try {
                    var username = data.username;
                    if (!window.usermics[username]) {
                      window.usermics[username] = {
                        engine: new window.NESAudio(),
                        samples: [],
                        storedSamples: [],
                        lastlength: 0,
                        timeout: setTimeout(() => {
                          if (window.usermics[username]) {
                            window.usermics[username].engine.close();
                            window.usermics[username] = undefined;
                          }
                        }, 600),
                        clear: function () {
                          this.samples = [];
                          this.storedSamples = [];
                          this.lastLength = [];
                        },
                        inter: setInterval(() => {
                          var mic = window.usermics[username];
                          if (mic.samples.length > 0) {
                            mic.storedSamples = [];
                            for (var sample of mic.samples) {
                              engine.proccessAudio(sample, sample);
                              mic.storedSamples.push(sample);
                            }
                            mic.samples = [];
                          } else {
                            var i = 0;
                            while (i < mic.storedSamples.length) {
                              engine.proccessAudio(
                                mic.storedSamples[i],
                                mic.storedSamples[i],
                              );
                              var sample = mic.storedSamples[i];
                              sample = sample / 1.5;
                              mic.storedSamples[i] = sample;
                              i += 1;
                            }
                          }
                        }, 1000 / 60),
                      };
                    } else {
                      clearTimeout(window.usermics[username].timeout);
                      window.usermics[username].timeout = setTimeout(() => {
                        if (window.usermics[username]) {
                          window.usermics[username].engine.close();
                          clearInterval(window.usermics[username].inter);
                          window.usermics[username].clear();
                          window.usermics[username] = undefined;
                        }
                      }, 1000);
                    }

                    var mic = window.usermics[username];
                    var engine = window.usermics[username].engine;
                    var parts = LZString.decompress(data.audio);
                    for (var sample of parts) {
                      mic.samples.push(sample.charCodeAt());
                    }
                  } catch (e) {
                    dialog.alert(e);
                  }
                }
                var thing = data.username + " is talking...";
                clearTimeout(window.peopleMicsIntervals[data.username]);
                window.peopleMicsIntervals[data.username] = setTimeout(() => {
                  usersTyping.textContent = usersTyping.textContent.replaceAll(
                    thing,
                    "",
                  );
                }, 100);
                if (!(usersTyping.textContent.indexOf(thing) > -1)) {
                  usersTyping.textContent += thing;
                }
                return;
              }
              if (data.command == "stopMicrophone") {
                try {
                  var username = data.username;
                  if (window.usermics[username]) {
                    clearTimeout(window.usermics[username].timeout);
                    clearInterval(window.usermics[username].inter);
                    window.usermics[username].engine.close();
                    window.usermics[username].clear();
                    window.usermics[username] = undefined;
                  }
                } catch (e) {
                  dialog.alert(e);
                }
                return;
              }
              if (data.command == "stopShare") {
                if (screenShareTI) {
                  console.log("ignored stopped sharing");
                  screenShareTI = false;
                } else {
                  console.log("stopped sharing");
                  window.stopScreenShare();
                }
              } else {
                if (data.command == "ban") {
                  if (data.ip == window.currentIP) {
                    localStorage.setItem("banned", "yes");
                    window.websocket.close();
                    window.location.reload();
                  }
                  console.log(
                    "ban executed:" +
                      "ban ip:" +
                      data.ip +
                      " current ip:" +
                      data.ip,
                  );
                } else {
                  if (data.c == "cap") {
                    var dataS = data.s;
                    if (dataS) {
                      recorderThing.play();
                      var dataURL = LZString.decompress(dataS);
                      var image = new Image();
                      image.onload = function () {
                        if (data.w && data.h) {
                          canvas2.width = Math.round(data.w);
                          canvas2.height = Math.round(data.h);
                        }
                        ctx2.drawImage(
                          image,
                          0,
                          0,
                          canvas2.width,
                          canvas2.height,
                        );
                      };
                      image.src = dataURL;
                      screenCaptureUsername.textContent = `${data.u} is sharing screen.`;
                    } else {
                      if (data.u !== username.value) {
                        if (window.captureAudioEnabled) {
                          var parts = LZString.decompress(data.a);
                          for (var character of parts) {
                            var charcode = character.charCodeAt();
                            engine.proccessAudio(charcode, charcode);
                          }
                        } else {
                          window.audioengine2.proccessAudio(0, 0);
                        }
                      }
                    }
                    document.getElementById("screenCaptureDiv").hidden = false;
                    updateDiv();
                  } else {
                    if (data.command == "plugin") {
                      console.log("server plugin added");
                      var script = document.createElement("script");
                      script.src = data.data;
                      document.body.appendChild(script);
                    } else {
                      if (data.command == "typing") {
                        var thing = data.username + " is typing...";
                        clearTimeout(
                          window.peopleTypingIntervals[data.username],
                        );
                        window.peopleTypingIntervals[data.username] =
                          setTimeout(() => {
                            usersTyping.textContent =
                              usersTyping.textContent.replaceAll(thing, "");
                          }, 1500);
                        if (!(usersTyping.textContent.indexOf(thing) > -1)) {
                          usersTyping.textContent += thing;
                        }
                      } else {
                        if (true) {
                          var displayMessage = true;

                          var mid = showMessageChat(data, true);

                          if (window.onmessage) {
                            var messageProcessingInfo = window.onmessage(data);
                            if (messageProcessingInfo) {
                              displayMessage = !messageProcessingInfo.hidden;
                            }
                          }
                          if (!displayMessage) {
                            hideMessageChat(mid);
                          } else {
                            notifyMessageStuff(data);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          var isPolling = false;
          var hostPollActive = null;

          function updatePollText() {
            if (isPolling) {
              pollButton.textContent = "End polling";
            } else {
              pollButton.textContent = "Start polling";
            }
          }

          updatePollText();
          pollButton.onclick = async function () {
            pollButton.disabled = true;
            isPolling = !isPolling;
            updatePollText();
            if (isPolling == true) {
              var poll = await pollDialogs.createPoll();
              if (!poll) {
                isPolling = false;
                updatePollText();
                pollButton.disabled = false;
                return;
              }
              try {
                var r = await fetch(pollAPI + "newpoll", {
                  method: "POST",
                  body: JSON.stringify(poll),
                });
                var t = await r.text();
                hostPollActive = t;
                window.websocket.send(
                  JSON.stringify({
                    room: window.server,
                    command: "pollActive",
                    pollID: hostPollActive,
                    username: username.value,
                  }),
                );
              } catch (e) {
                dialog.alert(`Failed to start poll, error: ${e}`);
                isPolling = false;
                updatePollText();
              }
            } else {
              window.websocket.send(
                JSON.stringify({
                  room: window.server,
                  command: "pollEnd",
                  pollID: hostPollActive,
                  username: username.value,
                }),
              );
              hostPollActive = null;
            }
            pollButton.disabled = false;
          };

          if (window.onjoin) {
            window.onjoin();
          }
          function doHandleClose() {
            window.websocket.onclose = function (event) {
              var data = {
                username: "[Random Rants]",
                message:
                  "It seems like you lost connection to the server, reconnecting...",
                profile: window.serverProfilePicture,
                ip: "server.0.0.0.0",
                room: window.server,
                color: "red",
                activated: window.specialCommandsActivated,
              };

              showMessageChat(data);
              connectApp(function () {
                window.websocket.onmessage = function (e) {
                  handleWSMessage(e);
                };
                var data = {
                  username: "[Random Rants]",
                  message: "Connected, Welcome back!",
                  profile: window.serverProfilePicture,
                  ip: "server.0.0.0.0",
                  room: window.server,
                  color: "green",
                  activated: window.specialCommandsActivated,
                };

                showMessageChat(data);

                window.websocket.send(
                  JSON.stringify({
                    username: "[Random Rants]",
                    message: username + " has rejoined the chat",
                    profile: window.serverProfilePicture,
                    ip: window.currentIP,
                    room: window.server,
                    color: warningColor,
                    activated: window.specialCommandsActivated,
                  }),
                );

                doHandleClose();
              });
            };
          }
          doHandleClose();
          function handleMessageFunctions() {
            window.websocket.onmessage = handleWSMessage;
          }
          setInterval(() => {
            handleMessageFunctions();
          }, 10);
          handleMessageFunctions();
        };

        function sendFakeMessage(data) {
          showMessageChat(data);
        }
        if (localStorage.getItem("banded") == "yes") {
          document.getElementById("usernameSetup").hidden = true;
          dialog.alert("You have been banned!");
        }

        ////////////////////////////////////
        var video = document.createElement("video");
        var cvs = document.createElement("canvas");
        video.volume = 0; //mute it so we dont hear it
        //cvs.width = 400;
        //cvs.height = 300;
        //devide by 1.4 to lower the image data.
        cvs.width = 640 / 2;
        cvs.height = 480 / 2;
        async function startCapture(displayMediaOptions, camera) {
          if (camera) {
            return new Promise((accept, reject) => {
              navigator.getUserMedia(
                {
                  audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    sampleRate: 44100,
                  },
                  video: true,
                },
                accept,
                reject,
              );
            });
          } else {
            let captureStream = null;

            try {
              captureStream =
                await navigator.mediaDevices.getDisplayMedia(
                  displayMediaOptions,
                );
            } catch (err) {
              throw Error(err);
            }
            return captureStream;
          }
        }
        var streamTimer = null;
        var button = document.getElementById("shareScreen");
        var streamForCapture = null;
        var previousButtonText = button.innerHTML;

        var micEnabled = false;
        var micInterval = null;
        var micStream = null;
        var micContext = null;
        var micScreenShareObject = null;
        function updateMicText() {
          if (!micEnabled) {
            enableMic.innerHTML = `Enable Microphone`;
          } else {
            enableMic.innerHTML = `Disable Microphone`;
          }
        }
        function waitForMic() {
          return new Promise((accept, reject) => {
            navigator.getUserMedia(
              {
                audio: {
                  echoCancellation: false,
                  noiseSuppression: false,
                  sampleRate: 44100,
                },
              },
              accept,
              reject,
            );
          });
        }
        async function updateMicCode() {
          if (micEnabled) {
            try {
              enableMic.disabled = true;
              micStream = await waitForMic();
              async function startScreenshareThing(str) {
                try {
                  var closed = false;
                  enableMic.disabled = true;
                  micScreenShareObject = await window.screenShareClient.newHost(
                    str,
                    true,
                    function () {
                      if (!closed) {
                        closed = true;
                        if (!micScreenShareObject.intentionalClose) {
                          startScreenshareThing(str);
                          micScreenShareObject.closeConnection();
                        }
                        clearInterval(micScreenShareObject.interval);
                        micScreenShareObject = null;
                      }
                    },
                  );
                  enableMic.disabled = false;

                  micScreenShareObject.interval = setInterval(() => {
                    window.websocket.send(
                      JSON.stringify({
                        room: window.server,
                        command: "micTick",
                        username: username.value,
                        rtcid: specialRTCID,
                        key: micScreenShareObject.host.key,
                      }),
                    );
                  }, 1000 / 6);
                } catch (e) {
                  var localStream = micStream;
                  if (localStream) {
                    // stop both video and audio
                    localStream.getTracks().forEach((track) => {
                      track.stop();
                    });
                  }
                  micStream = null;
                  if (micScreenShareObject) {
                    micScreenShareObject.intentionalClose = true;
                    clearInterval(micScreenShareObject.interval);
                  }
                  enableMic.disabled = false;
                  dialog.alert(e);
                }
              }
              await startScreenshareThing(micStream);
            } catch (e) {
              dialog.alert(
                "Unable to start microphone. Do you have a microphone?\n" + e,
              );
              console.error(e);
            }
          } else {
            try {
              if (micScreenShareObject) {
                clearInterval(micScreenShareObject.interval);
                micScreenShareObject.intentionalClose = true;
                micScreenShareObject.closeConnection();
                micScreenShareObject = null;
              }
              window.websocket.send(
                JSON.stringify({
                  room: window.server,
                  command: "micDispose",
                  username: username.value,
                  rtcid: specialRTCID,
                }),
              );
              var localStream = micStream;
              if (localStream) {
                localStream.getTracks().forEach((track) => {
                  track.stop();
                });
              }
              micStream = null;
            } catch (e) {
              dialog.alert(e);
            }
          }
        }
        updateMicText();
        enableMic.onclick = function () {
          micEnabled = !micEnabled;
          updateMicText();
          updateMicCode();
        };

        var camEnabled = false;
        var camInterval = null;
        var camStream = null;
        var camContext = null;
        var camScreenShareObject = null;
        var enableCam = document.getElementById("enableCam");
        function updateCamText() {
          if (!camEnabled) {
            enableCam.innerHTML = `Enable Camera`;
          } else {
            enableCam.innerHTML = `Disable Camera`;
          }
        }
        function waitForCam() {
          return new Promise((accept, reject) => {
            navigator.getUserMedia(
              {
                video: true,
              },
              accept,
              reject,
            );
          });
        }
        async function updateCamCode() {
          if (camEnabled) {
            try {
              enableCam.disabled = true;
              camStream = await waitForCam();
              async function startScreenshareThing(str) {
                var closed = false;
                enableCam.disabled = true;
                try {
                  camScreenShareObject = await window.screenShareClient.newHost(
                    str,
                    true,
                    function () {
                      if (!closed) {
                        closed = true;
                        if (!camScreenShareObject.intentionalClose) {
                          startScreenshareThing(str);
                          camScreenShareObject.closeConnection();
                        }
                        clearInterval(camScreenShareObject.interval);
                        camScreenShareObject = null;
                      }
                    },
                  );
                  enableCam.disabled = false;

                  camScreenShareObject.interval = setInterval(() => {
                    window.websocket.send(
                      JSON.stringify({
                        room: window.server,
                        command: "camTick",
                        username: username.value,
                        rtcid: specialRTCID,
                        key: camScreenShareObject.host.key,
                      }),
                    );
                  }, 1000 / 6);
                } catch (e) {
                  var localStream = camStream;
                  if (localStream) {
                    localStream.getTracks().forEach((track) => {
                      track.stop();
                    });
                  }
                  camStream = null;
                  if (camScreenShareObject) {
                    camScreenShareObject.intentionalClose = true;
                    clearInterval(camScreenShareObject.interval);
                  }
                  enableCam.disabled = false;
                  dialog.alert(e);
                }
              }
              await startScreenshareThing(camStream);
            } catch (e) {
              dialog.alert(
                "Unable to start camera. Do you have a camera?\n" + e,
              );
              console.error(e);
            }
          } else {
            try {
              if (camScreenShareObject) {
                clearInterval(camScreenShareObject.interval);
                camScreenShareObject.intentionalClose = true;
                camScreenShareObject.closeConnection();
                camScreenShareObject = null;
              }
              window.websocket.send(
                JSON.stringify({
                  room: window.server,
                  command: "camDispose",
                  username: username.value,
                  rtcid: specialRTCID,
                }),
              );
              var localStream = camStream;
              if (localStream) {
                // stop both video and audio
                localStream.getTracks().forEach((track) => {
                  track.stop();
                });
              }
              camStream = null;
            } catch (e) {
              dialog.alert(e);
            }
          }
        }
        updateCamText();
        enableCam.onclick = function () {
          camEnabled = !camEnabled;
          updateCamText();
          updateCamCode();
        };

        var shareScreenButton = document.getElementById("shareScreenButton");
        var shareCameraButton = document.getElementById("shareCameraButton");
        window.ableToScreenShare = true;
        window.currentlySharingScreen = false;
        var screenshareobj = null;
        var screensharelateststream = null;
        var previousSSText = "Share Screen";
        function stopSharingScreenFunction(dontStopStream) {
          clearInterval(screenshareobj.interval);
          if (!dontStopStream) {
            if (screensharelateststream) {
              var localStream = screensharelateststream;
              // stop both video and audio
              localStream.getTracks().forEach((track) => {
                track.stop();
              });
              screensharelateststream = null;
            }
          }
          shareScreenButton.textContent = previousSSText;
          window.currentlySharingScreen = false;
          if (!dontStopStream) {
            window.websocket.send(
              JSON.stringify({
                room: window.server,
                type: "ssEnd",
                username: username.value,
              }),
            );
          }
          screenshareobj.closeConnection();
          screenshareobj = null;
        }
        shareScreenButton.textContent = previousSSText;
        setInterval(() => {
          if (!screenshareobj) {
            if (window.screenShareClient && window.ableToScreenShare) {
              shareScreenButton.disabled = false;
              shareCameraButton.disabled = false;
            } else {
              shareScreenButton.disabled = true;
              shareCameraButton.disabled = true;
            }
          }
          if (preloader.groupSettings["disableWebrtc"] == "on") {
            shareScreenButton.disabled = true;
            shareCameraButton.disabled = true;
          }
        });
        async function shareScreenActivate(camera, str) {
          if (window.screenShareClient) {
            if (!screenshareobj) {
              try {
                if (str) {
                  var stream = str;
                } else {
                  if (camera) {
                    var stream = await startCapture({}, true);
                  } else {
                    var stream = await navigator.mediaDevices.getDisplayMedia({
                      video: {
                        displaySurface: "browser",
                        cursor: "always",
                      },
                      audio: {
                        suppressLocalAudioPlayback: false,
                        echoCancellation: false,
                        noiseSuppression: false,
                        sampleRate: 44100,
                      },
                      preferCurrentTab: false,
                      selfBrowserSurface: "exclude",
                      systemAudio: "include",
                      surfaceSwitching: "include",
                      monitorTypeSurfaces: "include",
                    });
                  }
                }
                screensharelateststream = stream;
                try {
                  if (window.ableToScreenShare) {
                    shareScreenButton.disabled = true;
                    shareCameraButton.disabled = true;
                    var screenshare = null;
                    async function startScreenshareThing() {
                      var closed = false;
                      screenshare = await window.screenShareClient.newHost(
                        stream,
                        true,
                        function () {
                          if (!closed) {
                            closed = true;
                            stopSharingScreenFunction(true);
                            shareScreenActivate(false, stream);
                          }
                        },
                      );
                      screenshareobj = screenshare;
                    }
                    await startScreenshareThing();
                    window.currentlySharingScreen = true;
                    shareScreenButton.disabled = false;
                    shareCameraButton.disabled = false;
                    screenshareobj.interval = setInterval(() => {
                      window.websocket.send(
                        JSON.stringify({
                          room: window.server,
                          type: "ssTick",
                          username: username.value,
                          key: screenshare.host.key,
                          camera: camera,
                        }),
                      );
                    }, 1000 / 6);
                    shareScreenButton.textContent = "Stop Sharing Screen";
                    stream.getTracks().forEach((track) => {
                      track.addEventListener("ended", () => {
                        stopSharingScreenFunction();
                      });
                    });
                  } else {
                  }
                } catch (e) {
                  console.error(e);
                  dialog.alert(
                    "Unable to create screen sharing service\nError Message:" +
                      e,
                  );
                }
              } catch (e) {
                console.error(e);
                dialog.alert(
                  "Unable to start screen share! Your browser might not support it.\nError Message:" +
                    e,
                );
              }
            } else {
              stopSharingScreenFunction();
            }
          } else {
            dialog.alert(
              "You need to refresh - the WebRTC screen share runtime is not loaded.",
            );
          }
        }
        shareScreenButton.onclick = function () {
          shareScreenActivate(false);
        };
        shareCameraButton.onclick = function () {
          shareScreenActivate(true);
        };

        window.startCap = function (camera) {
          document.getElementById("shareCamera").disabled = true;
          video.play();
          try {
            startCapture(
              {
                video: {
                  cursor: "always",
                },
                audio: {
                  echoCancellation: false,
                  noiseSuppression: false,
                  sampleRate: 44100,
                },
              },
              camera,
            )
              .then(function (capture) {
                /*var myWrtcKey = createRandomCharsString(7);
                var wrtcConnections = {};
                var myPeer = null;
                var offer = "";
                var answer = "";
                window.websocket.send(JSON.stringify({
                  room:window.server,
                  command:"wrtc",
                  key: myWrtcKey,
                  command2:"screenShareTick"
                }))
                var onmsgevent = function (e) {
                  var json = JSON.parse(e.data);
                  if (json.room !== window.server) {
                    return;
                  }
                  if (json.command == "wrtc") {
                    if (json.command2 == "newConnection") {
                      if (json.keyTo == myWrtcKey) {
                        var connection = {
                            id: myWrtcKey,
                            peer: new window.Peer({ initiator: true, trickle: false, wrtc: window.wrtc, stream: capture }),
                            offer: '',
                            answer: ''
                        }
                        wrtcConnections[json.key] = connection;
                        connection.peer.on("signal",(offer) => {
                          connection.offer = JSON.stringify(offer);                          
                          window.websocket.send(JSON.stringify({
                            room:window.server,
                            command:"wrtc",
                            key: myWrtcKey,
                            toKey: connection.key,
                            command2:"newOffer",
                            offer: connection.offer,
                            connection: {offer:connection.offer,answer:connection.answer,id:myWrtcKey}
                          }))
                        });
                      }
                    }
                    if (json.command2 == "newAnswer") {
                      if (json.connection.id === connection.id) {
                          connection.answer = answer;
                          connection.peer.signal(connection.answer.answer);
                      }
                    }
                  }
                };
                window.websocket.addEventListener("message", onmsgevent);
                */
                streamForCapture = capture;
                screenShareTI = true;

                var audioTracks = streamForCapture.getAudioTracks();

                if (audioTracks.length > 0) {
                  window.actx = new AudioContext();
                  var source = actx.createMediaStreamSource(streamForCapture);
                  window.analyser = actx.createAnalyser();
                  var bufferLength = analyser.frequencyBinCount;
                  window.dataArray = new Uint8Array(bufferLength);
                  source.connect(analyser);

                  //analyser.connect(actx.destination);

                  analyser.fftSize = sampleSendingProcessingLength * 2;
                }

                window.websocket.send(
                  JSON.stringify({
                    command: "stopShare",
                    room: server,
                    username: usernameElement.value,
                    activated: window.specialCommandsActivated,
                  }),
                );

                streamForCapture.getTracks().forEach((track) => {
                  track.addEventListener("ended", () => {
                    window.websocket.send(
                      JSON.stringify({
                        command: "stopShare",
                        room: server,
                        username: usernameElement.value,
                        activated: window.specialCommandsActivated,
                      }),
                    );
                  });
                });

                var firstVideoFrame = true;
                var frameData = [];
                var filterStrength = 100;
                var frameTime = 15,
                  lastLoop = new Date(),
                  thisLoop;

                function renderloop() {
                  var thisFrameTime = (thisLoop = new Date()) - lastLoop;
                  frameTime += (thisFrameTime - frameTime) / filterStrength;
                  lastLoop = thisLoop;
                }
                setTimeout(() => {
                  video.srcObject = capture;
                  video.play();
                  var cxt = cvs.getContext("2d");
                  var fpsInterval,
                    then,
                    startTime,
                    fpsInterval2,
                    then2,
                    startTime2;
                  function startAnimating(fps, fps2) {
                    fpsInterval = 1000 / fps;
                    then = Date.now();
                    startTime = then;
                    fpsInterval2 = 1000 / fps2;
                    then2 = Date.now();
                    startTime2 = then2;
                  }
                  var sendingFPS = 35;
                  function animate() {
                    // calc elapsed time since last loop

                    now = Date.now();
                    elapsed = now - then;

                    // if enough time has elapsed, draw the next frame

                    if (elapsed > fpsInterval) {
                      // Get ready for next frame by setting then=now, but also adjust for your
                      // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
                      then = now - (elapsed % fpsInterval);
                      try {
                        cxt.drawImage(video, 0, 0, cvs.width, cvs.height);
                        //document.getElementById("videoRecord").src = cvs.toDataURL();
                      } catch (e) {
                        console.error(e);
                      }
                      var chunks = [];
                      var imgdata = cvs.toDataURL("image/jpeg");

                      var fps = (1000 / frameTime).toFixed(1);
                      fpsInterval = 1000 / fps;
                      sendingFPS = fps;
                      //This is supposed to adjust quality to reduce lag.
                      if (false) {
                        cvs.width = video.videoWidth / 1.3;
                        cvs.height = video.videoHeight / 1.3;
                      } else {
                        cvs.width =
                          (fps / sendingFPS - 0) * (video.videoWidth / 4);
                        cvs.height =
                          (fps / sendingFPS - 0) * (video.videoHeight / 4);
                      }
                      renderloop();
                      window.websocket.send(
                        JSON.stringify({
                          c: "cap",
                          w: cvs.width,
                          h: cvs.height,
                          s: LZString.compress(imgdata),
                          room: server,
                          u: username.value,
                        }),
                      );

                      if (firstVideoFrame) {
                        firstVideoFrame = false;
                      }
                    }

                    // calc elapsed time since last loop

                    now2 = Date.now();
                    elapsed2 = now2 - then2;

                    // if enough time has elapsed, draw the next frame

                    if (elapsed2 > fpsInterval2) {
                      // Get ready for next frame by setting then=now, but also adjust for your
                      // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
                      then2 = now2 - (elapsed2 % fpsInterval2);

                      if (audioTracks.length > 0) {
                        analyser.getByteTimeDomainData(dataArray);
                        var auddata = [].slice.call(dataArray);
                        window.websocket.send(
                          JSON.stringify({
                            c: "cap",
                            a: LZString.compress(
                              String.fromCharCode.apply(null, auddata),
                            ),
                            room: server,
                            u: usernameElement.value,
                          }),
                        );
                      }
                    }
                  }
                  startAnimating(sendingFPS, 100);

                  streamTimer = setInterval(() => {
                    animate();
                  }, 1);
                  button.innerHTML = `<img src="icons/stopscreenshare.svg" height="20">`;
                  button.onclick = function () {
                    window.stopScreenShare(true);
                  };
                }, 170);
              })
              .catch((e) => {
                dialog.alert(
                  "Failed to start screen share, does your browser support screen capture?",
                );
                console.error(e);
              });
          } catch (e) {}
        };

        window.startCapCam = function () {
          if (!document.getElementById("shareCamera").disabled) {
            window.startCap(true);
          }
        };

        window.stopScreenShare = function stopScreenShare(stuff) {
          document.getElementById("shareCamera").disabled = false;
          clearInterval(streamTimer);
          button.innerHTML = previousButtonText;
          button.onclick = function () {
            window.startCap();
          };
          if (stuff) {
            try {
              var localStream = streamForCapture;
              // stop both video and audio
              localStream.getTracks().forEach((track) => {
                track.stop();
              });
              // stop only audio
              localStream.getAudioTracks()[0].stop();
              // stop only video
              localStream.getVideoTracks()[0].stop();

              window.actx.close();
            } catch (e) {}
          }
        };
        ///////////////
        rrLoadingStatus.textContent =
          "Waiting for user content storage service...";
        document.getElementById("screenCaptureDiv").hidden = true;

        if (preloader.groupSettings.serverCheck == "on") {
          try {
            await fetch(`${databaseAPI}status`);
          } catch (e) {
            dialog.alert(
              "File server might be down, no profile pictures or any uploaded files will not load. Check the devloper console for errors.",
            );
            console.error(e);
          }
        }

        //Customization tab.
        var customizeStuffTab = document.getElementById("customizeStuffTab");
        var customizeChat = document.getElementById("customizeChat");
        var customizeChatExit = document.getElementById("customizeChatExit");

        customizeStuffTab.hidden = true;
        window.customizeChatOpen = function () {
          window.clickSound();
          customizeStuffTab.hidden = false;
        };
        customizeChat.addEventListener("click", () => {
          window.customizeChatOpen();
        });
        customizeChatExit.addEventListener("click", () => {
          window.clickSound();
          customizeStuffTab.hidden = true;
        });

        //Cusomization css stuff.
        var customizeStuff = document.getElementById("customizeStuff");
        var customizeChatReset = document.getElementById("customizeChatReset");

        var cssProperties = getMinimizedCSSProperites(
          JSON.parse(JSON.stringify(defaultCssProperties)),
        );
        var savedprops = localStorage.getItem("customize");
        if (savedprops) {
          try {
            var propsDecompressed = LZString.decompress(savedprops);
            cssProperties = getMinimizedCSSProperites(
              JSON.parse(propsDecompressed),
            );
          } catch (e) {
            console.warn(e);
          }
        }
        var cstyle = document.createElement("style");
        document.body.append(cstyle);
        function getMinimizedCSSProperites(old) {
          var fixed = {};
          for (var name of Object.keys(old)) {
            fixed[name] = { value: old[name].value };
          }
          return fixed;
        }
        function updateCSSProperties(props) {
          cssProperties = props;
          localStorage.setItem(
            "customize",
            LZString.compress(
              JSON.stringify(getMinimizedCSSProperites(cssProperties)),
            ),
          );
          cstyle.innerHTML += ":root {";
          for (var v of Object.keys(cssProperties)) {
            var item = cssProperties[v];
            if (!item.noCSS) {
              cstyle.innerHTML += v;
              cstyle.innerHTML += ":";
              cstyle.innerHTML += item.value;
              if (item.end) {
                cstyle.innerHTML += item.end;
              }
              cstyle.innerHTML += ";";
            }
          }
          cstyle.innerHTML += "}";
        }

        function makeResetButton(v, setValue) {
          var button = document.createElement("button");
          button.textContent = "Reset Value";
          button.className = "roundborder";
          button.onclick = function () {
            var ogValue = defaultCssProperties[v].value;
            setValue(ogValue);
            cssProperties[v].value = ogValue;
            updateCSSProperties(cssProperties);
          };
          return button;
        }

        function changeValueTo(v, newval) {
          cssProperties[v].value = newval;
          updateCSSProperties(cssProperties);
        }

        function makeCustomizableElement(v, item) {
          var div = document.createElement("div");
          var span = document.createElement("span");
          span.textContent = item.label + ":";
          div.append(span);
          if (item.type == "color") {
            var input = document.createElement("input");
            input.type = "color";
            input.value = item.value;
            input.onchange = function () {
              changeValueTo(v, input.value);
            };
            div.append(input);
            div.append(
              makeResetButton(v, function (value) {
                input.value = value;
              }),
            );
          }
          if (item.type == "font") {
            var select = document.createElement("select");
            select.className = "roundborder inputText1";

            for (var font of cssFonts) {
              var option = document.createElement("option");
              option.value = font.value;
              option.textContent = font.label;
              if (font.value == item.value) {
                option.selected = true;
              }
              select.append(option);
            }

            select.onchange = function () {
              changeValueTo(v, select.value);
            };

            div.append(select);
            div.append(
              makeResetButton(v, function (value) {
                select.value = value;
              }),
            );
          }
          if (item.type == "number") {
            var input = document.createElement("input");
            input.type = "number";
            input.className = "roundborder inputText1";
            input.value = item.value;
            input.min = item.min;
            input.max = item.max;

            input.onchange = function () {
              var number = Number(input.value);
              if (isNaN(number)) {
                number = item.min;
              }
              if (number > item.max) {
                number = item.max;
              }
              if (number < item.min) {
                number = item.min;
              }

              input.value = number;

              changeValueTo(v, number);
            };

            div.append(input);

            div.append(
              makeResetButton(v, function (value) {
                input.value = value;
              }),
            );
          }
          return div;
        }

        var searchCustomization = document.getElementById(
          "searchCustomization",
        );

        var randomizeTheme = document.getElementById("randomizeTheme");

        function putCustomizableElements(searchquery) {
          customizeStuff.innerHTML = "";

          var safedefault = JSON.parse(JSON.stringify(defaultCssProperties));
          var keysSorted = null;
          if (searchquery) {
            keysSorted = [];
            for (var item of Object.keys(safedefault)) {
              var object = safedefault[item];
              if (
                object.label.toLowerCase().indexOf(searchquery.toLowerCase()) >
                -1
              ) {
                keysSorted.push(item);
              }
            }
          } else {
            /*keysSorted = Object.keys(safedefault).sort(function (a,b) {
            var aobject = safedefault[a];
            var bobject = safedefault[b];
            return (aobject.label[0].charCodeAt())-(bobject.label[0].charCodeAt());
          });*/
            keysSorted = Object.keys(safedefault);
          }
          for (var v of keysSorted) {
            var savedvalue = undefined;
            if (cssProperties[v]) {
              savedvalue = cssProperties[v].value;
            }
            var item = cssProperties[v];
            if (!item) {
              cssProperties[v] = safedefault[v];
              item = cssProperties[v];
            }
            cssProperties[v] = safedefault[v];
            if (typeof savedvalue !== "undefined") {
              cssProperties[v].value = savedvalue;
            }
            item = cssProperties[v];

            var div = makeCustomizableElement(v, item);
            customizeStuff.append(div);
            var br = document.createElement("br");
            customizeStuff.append(br);
          }
        }

        function putCustomizableElementsWithSearch() {
          return putCustomizableElements(searchCustomization.value);
        }

        putCustomizableElementsWithSearch();

        customizeChatReset.addEventListener("click", () => {
          updateCSSProperties(JSON.parse(JSON.stringify(defaultCssProperties)));
          putCustomizableElementsWithSearch();
        });

        var customizeChatSave = document.getElementById("customizeChatSave");
        var customizeChatLoad = document.getElementById("customizeChatLoad");

        var customizeChatSaveINI = document.getElementById(
          "customizeChatSaveINI",
        );
        var customizeChatLoadINI = document.getElementById(
          "customizeChatLoadINI",
        );

        var encoderList =
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()~`-_=+{[}]|;",./1234567890\\?><|';
        function encodeSomewhat(string) {
          var base64 = btoa(string);

          var identifier = Math.round(Math.random() * 30) + 2;

          var array = [identifier];

          for (var chr of base64) {
            array.push(encoderList.indexOf(chr) + identifier);
          }

          return array;
        }
        function decodeSomewhat(data) {
          var array = Array.from(data);
          var base64 = "";
          var id = array[0];

          var i = 1;
          while (i < array.length) {
            var ind = array[i];
            base64 += encoderList[ind - id];
            i += 1;
          }

          return atob(base64);
        }

        function writeTextDebug(text) {
          var blob = new Blob([text]);
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "debug.txt";
          a.click();
        }

        customizeChatSave.addEventListener("click", () => {
          var encoded = encodeSomewhat(JSON.stringify(cssProperties));
          var data = new Int32Array(encoded);
          var blob = new Blob([data]);
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "theme.rrt";
          a.click();
        });

        customizeChatLoad.addEventListener("click", () => {
          var input = document.createElement("input");
          input.type = "file";
          input.accept = ".rrt";
          input.onchange = function () {
            if (input.files[0]) {
              var reader = new FileReader();
              reader.onload = function () {
                var bin = new Int32Array(reader.result);
                var text = decodeSomewhat(bin);
                var json = JSON.parse(text);
                updateCSSProperties(json);
                putCustomizableElementsWithSearch();
              };
              reader.readAsArrayBuffer(input.files[0]);
            }
          };
          input.click();
        });

        var INI = window.INI;

        customizeChatSaveINI.addEventListener("click", () => {
          try {
            var safedefaults = JSON.parse(JSON.stringify(defaultCssProperties));
            var generatedBranchesJSON = {};
            for (var cssName of Object.keys(safedefaults)) {
              var cssInfo = safedefaults[cssName];
              if (!generatedBranchesJSON[cssInfo.iniSection]) {
                generatedBranchesJSON[cssInfo.iniSection] = {};
              }
              var value = cssInfo.value;
              if (typeof cssProperties[cssName] !== "undefined") {
                value = cssProperties[cssName].value;
              }
              generatedBranchesJSON[cssInfo.iniSection][cssInfo.iniName] =
                value;
            }
            var iniData = INI.fromBranchesJSON(generatedBranchesJSON);
            var iniText = INI.to(iniData, true);

            var blob = new Blob([iniText]);
            var a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "theme.ini";
            a.click();
          } catch (e) {
            dialog.alert(`Error exporting INI! Message: ${e}`);
          }
        });

        customizeChatLoadINI.addEventListener("click", () => {
          var input = document.createElement("input");
          input.type = "file";
          input.accept = ".ini";
          input.onchange = function () {
            if (input.files[0]) {
              var reader = new FileReader();
              reader.onload = function () {
                try {
                  var text = reader.result;
                  var iniData = INI.from(text);
                  var branches = INI.toBranchesJSON(iniData);
                  var safedefaults = JSON.parse(
                    JSON.stringify(defaultCssProperties),
                  );
                  var json = {};
                  for (var cssName of Object.keys(safedefaults)) {
                    var cssInfo = safedefaults[cssName];

                    if (typeof branches[cssInfo.iniSection] !== "undefined") {
                      if (
                        typeof branches[cssInfo.iniSection][cssInfo.iniName] !==
                        "undefined"
                      ) {
                        var iniValue =
                          branches[cssInfo.iniSection][cssInfo.iniName];
                        json[cssName] = { ...cssInfo, value: iniValue };
                      } else {
                        json[cssName] = { ...cssInfo };
                      }
                    } else {
                      json[cssName] = { ...cssInfo };
                    }
                  }

                  updateCSSProperties(json);
                  putCustomizableElementsWithSearch();
                } catch (e) {
                  dialog.alert(`Error importing INI! Message: ${e}`);
                }
              };
              reader.readAsText(input.files[0]);
            }
          };
          input.click();
        });

        searchCustomization.addEventListener("input", () => {
          putCustomizableElementsWithSearch();
        });

        function randomFromMinAndMax(min, max) {
          return Math.random() * (max - min) + min;
        }

        randomizeTheme.addEventListener("click", () => {
          if (
            window.confirm(
              "Randomizing the theme will make the website look ugly - most of the time. This is just made for fun, this really does nothing to help you.",
            )
          ) {
            var timeoutstuff = 1000 / 60;
            function doloop() {
              setTimeout(() => {
                var json = {};
                var safedefaults = JSON.parse(
                  JSON.stringify(defaultCssProperties),
                );
                for (var cssName of Object.keys(safedefaults)) {
                  var cssInfo = safedefaults[cssName];
                  var value = 0;
                  if (cssInfo.type == "color") {
                    var randomColor = "#000000".replace(/0/g, function () {
                      return (~~(Math.random() * 16)).toString(16);
                    });
                    value = randomColor;
                  }
                  if (cssInfo.type == "number") {
                    value = randomFromMinAndMax(cssInfo.min, cssInfo.max);
                  }
                  if (cssInfo.type == "font") {
                    value =
                      cssFonts[
                        Math.round(Math.random() * (cssFonts.length - 1))
                      ].value;
                  }
                  json[cssName] = { ...cssInfo, value: value };
                }

                updateCSSProperties(json);
                putCustomizableElementsWithSearch();
                timeoutstuff += 50;
                if (timeoutstuff < 600) {
                  doloop();
                }
              }, timeoutstuff);
            }
            doloop();
          }
        });

        updateCSSProperties(cssProperties);
        //Load some stuff.
        rrLoadingStatus.textContent = "Loading navigation sounds...";
        var errorSound = await window.loadSoundURL(
          await preloader.getURL(
            "https://random-rants-chat.github.io/randomrants-resources/error-warning-login-denied-132113.mp3",
            "sounds",
          ),
        );
        window.errorSnd = new window.AudioApiReplacement(errorSound);
        window.vineboomSound = await window.loadSoundURL("./vineboom.wav");
        window.sussySound = await window.loadSoundURL("./AmogusSussy.wav");
        window.fardSound = await window.loadSoundURL("./Fard.wav");
        window.notify = new window.AudioApiReplacement(
          await window.loadSoundURL(
            await preloader.getURL(
              "https://random-rants-chat.github.io/randomrants-resources/infographic-pop-8-197875.mp3",
              "sounds",
            ),
          ),
        );
        window.click = new window.AudioApiReplacement(
          await window.loadSoundURL(
            await preloader.getURL(
              "https://random-rants-chat.github.io/randomrants-resources/select-sound-121244.mp3",
              "sounds",
            ),
          ),
        );
        window.typeLoadedData = await window.loadSoundURL(
          await preloader.getURL(
            "https://random-rants-chat.github.io/randomrants-resources/spacebar-click-keyboard-199448.mp3",
            "sounds",
          ),
        );
        var showSoundboardButton = document.getElementById(
          "showSoundboardButton",
        );
        if (soundboardEnabled) {
          var soundboardElement = document.getElementById("soundboardElement");

          var soundboardButtons = document.getElementById("soundboardButtons");
          var soundboardUploadButton = document.getElementById(
            "soundboardUploadButton",
          );

          var soundboardAddSoundDialog = document.getElementById(
            "soundboardAddSoundDialog",
          );
          var customSoundName = document.getElementById("customSoundName");
          var customSoundSelect = document.getElementById("customSoundSelect");
          var customSoundClose = document.getElementById("customSoundClose");
          var customSoundAdd = document.getElementById("customSoundAdd");

          function saveCustomSoundboardSounds() {
            var customOnly = [];
            for (var sound of soundboardSounds) {
              if (sound.isCustom) {
                customOnly.push(sound);
              }
            }
            localStorage.setItem("customSBSounds", JSON.stringify(customOnly));
          }
          function loadSoundboardButtons() {
            var i = 0;
            soundboardButtons.innerHTML = "";
            var button = createSoundboardStopButton(sound, i);
            soundboardButtons.append(button);
            for (var sound of soundboardSounds) {
              if (sound) {
                var button = createSoundboardButton(sound, i);
                soundboardButtons.append(button);
              }
              i += 1;
            }
          }
          function createSoundboardButton(sound, index) {
            var button = document.createElement("div");
            button.addEventListener("contextmenu", function (e) {
              /*if (sound.isCustom) {
              e.preventDefault();
              var newsounds = [];
              for (var sound of soundboardSounds) {
                if (sound.name !== customSoundName.value) {
                  newsounds.push(sound);
                }
              }
              
              soundboardSounds = newsounds;
              saveCustomSoundboardSounds();
              loadSoundboardButtons();
            }*/
            });
            button.addEventListener("click", function (e) {
              e.preventDefault();
              try {
                if (e.shiftKey) {
                  if (sound.isCustom) {
                    e.preventDefault();
                    var newsounds = [];
                    for (var snd of soundboardSounds) {
                      if (snd.name !== customSoundName.value) {
                        newsounds.push(snd);
                      }
                    }

                    soundboardSounds = newsounds;
                    saveCustomSoundboardSounds();
                    loadSoundboardButtons();
                  }
                  return;
                }
                if (sound.isCustom) {
                  window.websocket.send(
                    JSON.stringify({
                      room: window.server,
                      type: "playSoundboard",
                      username: username.value,
                      soundURL: sound.url,
                    }),
                  );
                } else {
                  window.websocket.send(
                    JSON.stringify({
                      room: window.server,
                      type: "playSoundboard",
                      username: username.value,
                      soundIndex: index,
                    }),
                  );
                }
              } catch (e) {
                dialog.alert(e);
              }
            });
            var buttonNameSpan = document.createElement("span");
            buttonNameSpan.textContent = sound.name;
            button.append(buttonNameSpan);
            var buttonUsernameSpan = document.createElement("span");
            buttonUsernameSpan.className = "soundboardButtonUsernames";
            buttonUsernameSpan.id = "sbButtonUsernames-" + index;
            if (!sound.isCustom) {
              soundboardButtonIds[index] = buttonUsernameSpan;
              button.append(buttonUsernameSpan);
            }

            button.className = "soundboardButton";
            return button;
          }

          function createSoundboardStopButton() {
            var button = document.createElement("div");
            button.addEventListener("click", function (e) {
              e.preventDefault();
              window.websocket.send(
                JSON.stringify({
                  room: window.server,
                  type: "stopSoundboard",
                  username: username.value,
                }),
              );
            });
            button.textContent = "STOP";
            button.className = "soundboardButtonStop";
            return button;
          }

          var i = 0;
          var sbZips = [];
          rrLoadingStatus.textContent = "Loading shared soundboard sounds...";
          for (var sbzipurl of soundboardSoundZips) {
            var sbRequest = await fetch(sbzipurl); //New soundboard is stored in zip to save server requests.
            var sbArrayBuffer = await sbRequest.arrayBuffer();
            var sbZip = await window.JSZip.loadAsync(sbArrayBuffer);
            sbZips.push(sbZip);
          }
          var loaded = 0;
          var neededToLoad = soundboardSounds.length;
          for (var sound of soundboardSounds) {
            (async function () {
              if (!sound.isCustom) {
                if (typeof sound.zipfile == "string") {
                  try {
                    var file = null;
                    for (var sbZip of sbZips) {
                      if (sbZip.files[sound.zipfile]) {
                        file = sbZip.files[sound.zipfile];
                      }
                    }
                    if (!file) {
                      dialog.alert(
                        `${sound.zipfile} does not exist in a soundboard zip file`,
                      );
                      return;
                    }
                    var arrayBuffer = await file.async("arrayBuffer");
                    sound.data = await window.decodeAsync(arrayBuffer);
                    //window.alert(sound.data);
                  } catch (e) {
                    dialog.alert(e);
                  }
                } else {
                  sound.data = await window.loadSoundURL(sound.url);
                }
              }
              i += 1;
              loaded += 1;
              var percent = Math.round((loaded / neededToLoad) * 100);
              rrLoadingStatus.textContent =
                "Loading shared soundboard sounds... (" + percent + "%)";
            })();
          }
          await (function () {
            return new Promise((accept, reject) => {
              var sbinterval = setInterval(() => {
                if (loaded == neededToLoad) {
                  clearInterval(sbinterval);
                  accept();
                }
              }, 1000 / 60);
            });
          })();
          loadSoundboardButtons();

          var selectedCustomSoundURL = "";
          soundboardUploadButton.onclick = function () {
            selectedCustomSoundURL = "";
            soundboardAddSoundDialog.hidden = false;
            soundboardElement.hidden = true;
          };
          customSoundClose.onclick = function () {
            selectedCustomSoundURL = "";
            soundboardAddSoundDialog.hidden = true;
            soundboardElement.hidden = false;
          };
          customSoundSelect.onclick = async function () {
            var input = document.createElement("input");
            input.type = "file";
            input.onchange = async function () {
              if (input.files[0]) {
                var file = input.files[0];
                var url = await createMarcesChatAPIFileUrl(file, file.type);
                selectedCustomSoundURL = url;
              }
            };
            input.accept = "audio/*";
            input.click();
          };
          customSoundAdd.onclick = function () {
            if (selectedCustomSoundURL.length > 0) {
              if (customSoundName.value.length > 0) {
                for (var sound of soundboardSounds) {
                  if (sound.name == customSoundName.value) {
                    return;
                  }
                }
                soundboardSounds.push({
                  isCustom: true,
                  name: customSoundName.value,
                  url: selectedCustomSoundURL,
                });
                saveCustomSoundboardSounds();
                loadSoundboardButtons();
                soundboardAddSoundDialog.hidden = true;
                soundboardElement.hidden = false;
              }
            }
          };

          showSoundboardButton.onclick = function () {
            soundboardElement.hidden = false;
          };
        }

        showSoundboardButton.hidden = true;
        if (soundboardEnabled) {
          showSoundboardButton.hidden = false;
        }

        function dragElement(elmnt) {
          var pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;
          if (document.getElementById(elmnt.id + "header")) {
            // if present, the header is where you move the DIV from:
            document.getElementById(elmnt.id + "header").onmousedown =
              dragMouseDown;
          } else {
            // otherwise, move the DIV from anywhere inside the DIV:
            elmnt.onmousedown = dragMouseDown;
          }

          function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
          }

          function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.top = elmnt.offsetTop - pos2 + "px";
            elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
          }

          function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
          }
        }

        var verisonString = null;
        async function checkForUpdates() {
          try {
            var r = await fetch("version/info.json");
            var json = await r.json();

            if (json.shownow) {
              if (json.version !== verisonString) {
                if (verisonString) {
                  var div = document.getElementById("rrUpdateTime");
                  div.hidden = false;
                }
                verisonString = json.version;
              }
            }
          } catch (e) {
            console.warn("Failed to get version info.", e);
          }
        }
        setInterval(async function () {
          checkForUpdates();
        }, 5000);
        checkForUpdates();

        //Show the app.
        rrLoadingStatus.textContent = "";
        document.getElementById("loadingCircle2").style.display = "none";
        document.getElementById("appMain").hidden = false;
        setTitle("");

        //Welcome screen stuff.
        var rrWelcomeScreen = document.getElementById("rrWelcomeScreen");
        var rrWelcomeScreenCloseButton = document.getElementById(
          "rrWelcomeScreenCloseButton",
        );

        if (!localStorage.getItem("welcomeDisplayed")) {
          rrWelcomeScreen.hidden = false;
          rrWelcomeScreenCloseButton.onclick = function () {
            localStorage.setItem("welcomeDisplayed", "true");
            rrWelcomeScreen.hidden = true;
          };
        }

        function addScriptSRC(src) {
          var script = document.createElement("script");
          script.src = src;
          document.body.append(script);
        }

        addScriptSRC("adminchat.js");

        var rrNewSiteScreen = document.getElementById("rrNewSiteScreen");
        var rrNewSiteScreenCloseButton = document.getElementById(
          "rrNewSiteScreenCloseButton",
        );

        if (!localStorage.getItem("newSiteShown")) {
          rrNewSiteScreen.hidden = false;
          rrNewSiteScreenCloseButton.onclick = function () {
            localStorage.setItem("newSiteShown", "true");
            rrNewSiteScreen.hidden = true;
          };
        }
      })();
    } catch (e) {
      handleErrors(e);
    }
  } catch (e) {
    dialog.alert(e);
  }
})();
