var mutepassword = "skibi";
var dialog = window.dialog;
var usernameWhitelistforthings = ["eli", "gvbvdxx", "eli_", "admin"];
window.adminCommandsServerObject = new chat.server();
window.adminCommandsAudioObject = new chat.audio();
window.onjoin = function () {};
window.adminCommandsMuted = false;
var usernameInputElement = document.getElementById("username");
function getIsUserFromValue(uservalue, msgData) {
  if (!uservalue) {
    return false;
  }
  if (usernameInputElement.value.toLowerCase() == uservalue.toLowerCase()) {
    return true;
  }
  if (uservalue.startsWith("~")) {
    var lowercased = uservalue.toLowerCase();
    if (
      usernameInputElement.value
        .toLowerCase()
        .startsWith(lowercased.slice(1, lowercased.length))
    ) {
      return true;
    }
  }
  if (uservalue == "@random" || uservalue == "random") {
    if (Math.random() * 10 < 2) {
      return true;
    }
  }
  if (uservalue == "@all" || uservalue == "all") {
    return true;
  }
  if (uservalue == "@others" || uservalue == "others") {
    if (msgData) {
      if (msgData.username !== usernameInputElement.value) {
        return true;
      }
    }
  }
  if (uservalue == "@me" || uservalue == "me") {
    if (msgData) {
      if (msgData.username == usernameInputElement.value) {
        return true;
      }
    }
  }
  return false;
}
var bgPage = document.body;

var r = 0,
  g = 0,
  b = 0;

function bg() {
  if (r <= 255 && g == 0 && b == 0) {
    r += 5;
  }

  if (r == 255 && b == 0 && g <= 255) {
    g += 5;
  }

  if (r == 255 && g == 255 && b <= 255) {
    b += 5;
  }

  if (b == 255 && g == 255 && r > 0) {
    r -= 5;
  }

  if (r == 0 && b == 255 && g > 0) {
    g -= 5;
  }

  if (r == 0 && g == 0 && b > 0) {
    b -= 5;
  }

  setTimeout(function () {
    bg();
  }, 30);

  bgPage.style.background = "rgb(" + r + "," + g + "," + b + ")";
}
var lockedDiv = null;
var music = document.createElement("audio");
music.looped = true;
var musicPlaying = false;
setInterval(function () {
  if (musicPlaying) {
    music.play();
  } else {
    music.pause();
  }
}, 1);

window.safeCommands = [
  "confetti", //Spamming command will not do anything.
  "forceOpen", //Fore open must have a user interaction to work.
  "rainbow", //Breaks the background, but does not break the website.
  "unlock", //Unlocks the user, this is replaced with unmute.
  "play", //Play an audio file.
  "rickrollAudio", //basically is the play command.
  "pause", //Pauses the audio file.
  "commands", //Shows an list of commands, the list will only show for the person that types the command.
  "volume", //Volume of the audio file.
  "dvdLogo", //Shows a dvd logo that bounces off the edges of the screen.
  "whisper", //Shows a message only for the specified person.
  "hungry", //Just plays an sound.
  "pitch", //Changes the pitch of the audio file.
  "notifyMessage", //Shows a notifcation.
  "speak", //Just speaks text.
];

function parseCommandStuff(props) {
  var text = props.join(" ");
  var output = JSON.parse(`[${text}]`);
  var switched = false;
  return output;
}

window.commandInfo = {
  confetti:
    "(Optional: Color names, or hex color codes. Separated by a whitespace.)",
  m: "<Message>",
  forceOpen: "<URL>",
  funni: "(No properties required)",
  uh: "(No properties required)",
  luig: "(No properties required)",
  funniVirus: "(No properties required)",
  spin: "(No properties required)",
  scaleX: "<Scale value as number, 1 is original scale, floats allowed>",
  scaleY: "<Scale value as number, 1 is original scale, floats allowed>",
  lock: "<Username, @random, @all, or @others>",
  mute: "<Username, @random, @all, or @others>",
  annoy: "<Username, @random, @all, or @others>",
  unmute: "<Username, @random, @all, or @others>",
  commands: "(No properties required)",
  rainbow: "(No properties required)",
  america: "(No properties required)",
  hungry: "(No properties required)",
  kick: "<Username, @random, @all, or @others>",
  errors: "<Username, @random, @all, or @others>",
  idiot: "<Username, @random, @all, or @others>",
  bgImage: "<Image direct URL>",
  bgColor: "<Background CSS color, can be hex as well>",
  blackout: "<Username, @random, @all, or @others>",
  rickroll: "<Username, @random, @all, or @others>",
  nyan: "<Username, @random, @all, or @others>",
  play: "<Username, @random, @all, or @others> <Audio URL, must be a direct URL (use insert url button)>",
  pause: "<Username, @random, @all, or @others>",
  IP: "<Username, @random, @all, or @others>",
  skewX: "<Skewing degrees as number>",
  rotate: "<Degrees as number>",
  skewY: "<Skewing degrees as number>",
  talkUser: "<Username, @random, @all, or @others> <Message>",
  popcat: "<Username, @random, @all, or @others> <Length in seconds>",
  dvdLogo: "<Username, @random, @all, or @others> <Length in seconds>",
  addPlugin: "<Javascript direct URL>",
  rickrollAudio: "<Username, @random, @all, or @others>",
  pitch: "<Pitch as float or number>",
  volume: "<Volume percent as number>",
  whisper: "<Username, @random, @all, or @others> <Message>",
  execute: "<Username, @random, @all, or @others> <JavaScript Code>",
  changeUsenrmae:
    "<Username, @random, @all, or @others> <Username to change to>",
  changeColor:
    "<Username, @random, @all, or @others> <Color to change to (hex or color code)>",
  changePFP: "<Username, @random, @all, or @others> <Image URL>",
  showIP: "<Username, @random, @all, or @others>",
  listIPS: "(No properties required)",
  notifyMessage: "<Username, @random, @all or @others> <Message to display>",
  speak: "<Message to speak>",
  toggleCam: "<Username, @random, @all or @others>",
  toggleMic: "<Username, @random, @all or @others>",
};

var notifyCommandLastNotification = null;
let msg = new SpeechSynthesisUtterance();

window.commands = {
  /*multi: function (props, msg, executeAnotherCommand) {
    var a = parseCommandStuff(props);
    for (var thing of a) {
      executeAnotherCommand(thing,msg);
    }
  },*/
  speak: function (props) {
    msg.text = props.join(" ");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  },
  notifyMessage: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      if (notifyCommandLastNotification) {
        notifyCommandLastNotification.close();
      }
      try {
        var message = props.slice(1, props.length).join(" ");
        notifyCommandLastNotification = new Notification(
          `Random Rants - Admin Commands.`,
          {
            icon: "warningsign.svg",
            vibrate: [150, 60, 150],
            tag: "[Admin Commands]",
            body: `[${msg.username}]: ${message}`,
          },
        );
      } catch (e) {}
    }
  },
  showIP: function (props, msg) {
    adminCommandsServerObject.fakeMessage({
      message: 'Showing IP address for "' + props[0] + '"...',
      color: "green",
      name: "Admin Commands",
    });
    if (getIsUserFromValue(props[0], msg)) {
      adminCommandsServerObject.sendMessage({
        message: window.username.value + ": [blur]" + window.realIP + "[/blur]",
        color: "green",
        name: "Admin Commands",
      });
    }
  },
  listIPs: function (props, msg) {
    adminCommandsServerObject.fakeMessage({
      message: "Listing all connected users IP addresses...",
      color: "green",
      name: "Admin Commands",
    });
    adminCommandsServerObject.sendMessage({
      message: window.username.value + ": [blur]" + window.realIP + "[/blur]",
      color: "green",
      name: "Admin Commands",
    });
  },
  toggleCam: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      dialog
        .confirm("Someone wants you to toggle your camera.\nAccept?")
        .then((a) => {
          if (a) {
            document.getElementById("enableCam").click();
          }
        });
    }
  },
  toggleMic: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      dialog
        .confirm("Someone wants you to toggle your microphone.\nAccept?")
        .then((a) => {
          if (a) {
            document.getElementById("enableMic").click();
          }
        });
    }
  },
  changeUsername: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      window.username.value = props.slice(1, props.length).join(" ");
    }
  },
  changeColor: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      window.usercolor = props.slice(1, props.length).join(" ");
    }
  },
  changePFP: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      window.profilePicture = props.slice(1, props.length).join(" ");
    }
  },
  confetti: function (colors) {
    if (colors.length > 0) {
      window.setConfettiColors(colors);
    } else {
      window.setConfettiColors([]);
    }
    window.startConfetti();
    setTimeout(() => {
      window.stopConfetti();
    }, 1500);
  },
  m: function (props) {
    dialog.alert(props.join(" "));
  },
  forceOpen: function (props) {
    window.open(props.join(" "));
  },
  execute: function (props, msg) {
    var user = props[0];
    var code = props.slice(1, props.length).join(" ");
    if (getIsUserFromValue(props[0], msg)) {
      try {
        eval(code);
      } catch (e) {
        adminCommandsServerObject.fakeMessage({
          message: "Error trying to execute! " + e,
          color: "red",
          name: "Admin Commands",
        });
      }
    }
  },
  funni: async function () {
    var img = document.createElement("img");
    img.src = "https://jasonglenevans.github.io/GvbvdxxChatEmojis/MSG_5.png";
    img.style.top = "0";
    img.style.left = "0";
    img.style.position = "fixed";
    img.style.width = "100vw";
    img.style.height = "100vh";
    img.style.pointerEvents = "none";
    var audio = new Audio("laughing-chihuahua.mp3?n=1");
    await audio.play();
    document.body.append(img);
    audio.onended = () => {
      img.remove();
    };
  },
  uh: async function () {
    var img = document.createElement("img");
    img.src = "macres-a.svg";
    img.style.top = "0";
    img.style.left = "0";
    img.style.position = "fixed";
    img.style.width = "100vw";
    img.style.height = "100vh";
    img.style.pointerEvents = "none";
    document.body.append(img);
    setTimeout(async () => {
      var audio = new Audio("pause-or-balls-which-one.wav");
      audio.looped = false;
      await audio.play();
      img.src = "macres-b.svg";

      audio.onended = () => {
        img.src = "macres-a.svg";
        setTimeout(async () => {
          img.remove();
        }, 500);
      };
    }, 500);
  },
  luig: async function () {
    var video = document.createElement("video");
    video.src = "luig.mp4";
    video.style.top = "0";
    video.style.left = "0";
    video.style.position = "fixed";
    video.style.width = "100vw";
    video.style.height = "100vh";
    await video.play();
    document.body.append(video);
    video.onended = () => {
      video.remove();
    };
  },
  /*funniVirus: async function () {
    setInterval(async function () {
      var img = document.createElement("img");
      img.src = "https://jasonglenevans.github.io/GvbvdxxChatEmojis/MSG_5.png";
      img.style.top = "0";
      img.style.left = "0";
      img.style.position = "fixed";
      img.style.width = "100vw";
      img.style.height = "100vh";
      var audio = new Audio("laughing-chihuahua.mp3?n=1");
      await audio.play();
      document.body.append(img);
      audio.onended = () => {
        img.remove();
      };
    }, 1000 / 30);
    window.commands["errors"](["@all"]);
  },*/
  spin: function () {
    var rotatedeg = 0;
    var chat = document.getElementById("chat");
    var int = setInterval(() => {
      var spd = (360 * 2 - rotatedeg) / 5;
      if (spd > 30) {
        spd = 30;
      }
      if (spd < -30) {
        spd = -30;
      }
      rotatedeg += spd;
      chat.style.rotate = rotatedeg + "deg";
      if (rotatedeg + 0.2 > 360 * 2) {
        chat.style.rotate = "";

        clearInterval(int);
      }
    }, 1000 / 60);
  },
  scaleX: function (props) {
    document.body.style.transform = "scale(" + props[0] + ",1)";
  },
  scaleY: function (props) {
    document.body.style.transform = "scale(1," + props[0] + ")";
  },
  lock: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      if (!lockedDiv) {
        lockedDiv = document.createElement("div");
        var altTextArea = document.createElement("input");
        lockedDiv.style.top = 0;
        lockedDiv.style.left = 0;
        lockedDiv.style.position = "fixed";
        lockedDiv.style.zIndex = 1000000;
        lockedDiv.style.width = "100vw";
        lockedDiv.style.height = "100vh";
        lockedDiv.focus();
        document.body.appendChild(altTextArea);
        altTextArea.style.opacity = 0;
        altTextArea.focus();
        setTimeout(() => {
          altTextArea.remove();
        }, 1000);
        document.body.appendChild(lockedDiv);
      }
    }
    adminCommandsServerObject.fakeMessage({
      message: "locked " + props[0] + "'s screen.",
      color: "green",
      name: "Admin Commands",
    });
  },
  /*freezeOP: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      var total = "";
      for (var i = 0; i < 10000000000000; i++) {
        total += i.toString();
        history.pushState(0, 0, total);
      }
    }
    adminCommandsServerObject.fakeMessage({
      message: "Freezing " + props[0] + "'s web browser...",
      color: "green",
      name: "Admin Commands",
    });
  },*/
  mute: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      if (window.specialCommandsActivated) {
        adminCommandsServerObject.sendMessage({
          message:
            "" +
            usernameInputElement.value +
            " can't be muted, admin commands where activated.",
          color: "red",
          name: "Admin Commands",
        });
      } else {
        window.chatMuted = true;
        localStorage.setItem("isMute", "true");
      }
    }
    adminCommandsServerObject.fakeMessage({
      message: "" + props[0] + " can no longer post messages.",
      color: "green",
      name: "Admin Commands",
    });
    return { hidden: true };
  },
  unmute: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      window.chatMuted = false;
      localStorage.removeItem("isMute");
    }
    adminCommandsServerObject.fakeMessage({
      message: "" + props[0] + " can now post messages.",
      color: "green",
      name: "Admin Commands",
    });
    return { hidden: true };
  },
  blackout: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      if (true) {
        var blackout = document.createElement("div");
        blackout.style.top = 0;
        blackout.style.left = 0;
        blackout.style.position = "fixed";
        blackout.style.zIndex = 1000000;
        blackout.style.backgroundColor = "black";
        blackout.style.width = "100vw";
        blackout.style.height = "100vh";
        blackout.focus();
        console.log(blackout);
        document.body.appendChild(blackout);
      }
    }
  },
  rainbow: bg,
  unlock: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      if (lockedDiv) {
        lockedDiv.remove();
        adminCommandsServerObject.fakeMessage({
          message: "unlocked " + props[0] + "'s screen.",
          color: "green",
          name: "Admin Commands",
        });
      }
    }
  },
  kick: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      window.location.reload();
    }
  },
  /*crash: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      adminCommandsServerObject.fakeMessage({
        message: "crashed " + props[0] + "'s page.",
        color: "green",
        name: "Admin Commands",
      });
      while (true) {}
    }
  },*/
  play: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      music.src = props[1];
      music.play();
      musicPlaying = true;
    }
  },
  rickrollAudio: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      music.src = "jocofullinterview41.mp3";
      music.play();
      musicPlaying = true;
    }
  },
  rickroll: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      document.write(
        '<video src="Rick_Astley_Never_Gonna_Give_You_Up.ogv" autoplay style="position:absolute;top:0;left:0;width:100%;height:100vh;background-color:black;"></video>',
      );
    }
  },
  pause: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      musicPlaying = false;
    }
  },
  annoy: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      setInterval(() => {
        adminCommandsAudioObject.typeSound();
        adminCommandsAudioObject.clickSound();
      }, 1);
      setInterval(() => {
        adminCommandsAudioObject.notifySound();
      }, 100);
    }
  },
  commands: function (props, msg) {
    if (msg.username == usernameInputElement.value) {
      var info = [];
      for (var stuff of Object.keys(this)) {
        var highlightColor = "green";
        if (window.safeCommands.indexOf(stuff) < 0) {
          if (!msg.activated) {
            highlightColor = "red";
          }
        }
        if (highlightColor !== "red") {
          var props = "(No listing properties given)";
          if (window.commandInfo[stuff]) {
            props = window.commandInfo[stuff];
          }
          info.push(
            "[bold][color color=" +
              highlightColor +
              "]" +
              stuff +
              "[/color][/bold]" +
              " [color color=yellow]" +
              props +
              "[/color]",
          );
        }
      }
      var message2 = "[color color=red](Unactivated)[/color]";
      if (msg.activated) {
        message2 = "[color color=green](Activated)[/color]";
      }
      adminCommandsServerObject.fakeMessage({
        message:
          "[br][bold]List of possible commands[/bold] [bold]" +
          message2 +
          "[/bold]:[br];" +
          info.join("[br][br];"),
        color: "green",
        name: "Admin Commands",
      });
    }
  },
  robux: function () {
    adminCommandsServerObject.fakeMessage({
      message:
        "Your offered FREE robux! Click [buttonJavascript url=window.location.reload()]HERE[/buttonJavascript] to claim your prize!",
      color: "green",
      name: "Yay!",
    });
  },
  volume: function (args) {
    music.volume = args[0] / 100;
  },
  pitch: function (args) {
    music.preservesPitch = false;
    music.playbackRate = args[0] / 100 + 1;
  },
  addPlugin: function (args) {
    var script = document.createElement("script");
    script.src = args.join(" ");
    document.body.appendChild(script);
  },
  bgImage: function (args) {
    document.body.style.backgroundImage = "url('" + args[0] + "')";
  },
  nyan: function (props, msg) {
    var url = "nyan.js";
    if (getIsUserFromValue(props[0], msg)) {
      var script = document.createElement("script");
      script.src = url;
      document.body.appendChild(script);
    }
  },
  /*idiot: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      document.write(`
			<video src='http://youareanidiot.cc/media/youare.mp4' autoplay style='top:0;left:0;width:100%;height:100vh;position:fixed;' loop></video>
			<script>
			setInterval(() => {
				window.open("http://youareanidiot.cc/",50,50);
			},1);
			
			</script>
			`);
    }
  },*/
  dvdLogo: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      var ms = 1000;
      if (Number(props[1])) {
        ms = Number(props[1]) * 1000;
      }
      if (ms > 1000 * 20) {
        ms = 1000 * 20;
      }
      let speed = 1000 / 60;
      let scale = window.innerHeight / 4000 / 2; // Image scale (I work on 1080p monitor)
      let canvas;
      let ctx;
      var active = true;
      let logoColor;

      let dvd = {
        x: 0,
        y: 0,
        xspeed: 1.5,
        yspeed: 1.5,
        img: new Image(),
      };

      (function main() {
        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
        dvd.img.src =
          "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/dvd-logo.png?v=1714150030644";
        //dvd.img.width = (window.innerWidth/500)*200;
        //dvd.img.height = (window.innerWidth/500)*100;
        //Draw the "tv screen"
        canvas.width = window.innerWidth / 2;
        canvas.height = window.innerHeight / 2;
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        canvas.style.imageRendering = "pixelated";
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.pointerEvents = "none";

        dvd.img.onload = function () {
          pickColor();
          update();
          document.body.appendChild(canvas);
          setTimeout(() => {
            active = false;
            canvas.remove();
          }, ms);
        };
      })();

      var dvdScale = 1;

      function update() {
        setTimeout(() => {
          if (active) {
            canvas.width = window.innerWidth / 1;
            canvas.height = window.innerHeight / 1;
            canvas.style.width = window.innerWidth + "px";
            canvas.style.height = window.innerHeight + "px";
            ctx.fillStyle = "#000";
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(
              dvd.img,
              dvd.x,
              dvd.y,
              dvd.img.width * scale * dvdScale,
              dvd.img.height * scale * dvdScale,
            );
            dvd.x += dvd.xspeed;
            dvd.y += dvd.yspeed;
            checkHitBox();
            update();
          }
        }, speed);
      }

      //Check for border collision
      function checkHitBox() {
        if (
          dvd.x + dvd.img.width * scale * dvdScale >= canvas.width ||
          dvd.x <= 0
        ) {
          dvd.xspeed *= -1;
          pickColor();
        }

        if (
          dvd.y + dvd.img.height * scale * dvdScale >= canvas.height ||
          dvd.y <= 0
        ) {
          dvd.yspeed *= -1;
          pickColor();
        }
      }

      //Pick a random color in RGB format
      function pickColor() {
        r = Math.random() * (254 - 0) + 0;
        g = Math.random() * (254 - 0) + 0;
        b = Math.random() * (254 - 0) + 0;

        logoColor = "rgb(" + r + "," + g + ", " + b + ")";
      }
    }
  },
  popcat: function (props) {
    var ms = 1000;
    if (Number(props[0])) {
      ms = Number(props[0]) * 1000;
    }
    if (ms > 7000) {
      ms = 7000;
    }
    var img = document.createElement("img");
    var mouthOpen = false;
    img.style.top = "0";
    img.style.left = "0";
    img.style.position = "fixed";
    img.style.width = "100vw";
    img.style.height = "100vh";
    img.style.objectFit = "contain";
    img.style.pointerEvents = "none";
    document.body.append(img);
    var interval = setInterval(() => {
      mouthOpen = !mouthOpen;
      if (mouthOpen) {
        img.src =
          "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/pop-cat2.png?v=1713969814980";
        var popcat = document.createElement("audio");
        popcat.src =
          "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/infographic-pop-8-197875.mp3?v=1713915310573";
        popcat.play();
      } else {
        img.src =
          "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/pop-cat.png?v=1713969813552";
      }
    }, 1000 * 0.06);
    setTimeout(() => {
      clearInterval(interval);
      img.remove();
    }, ms);
  },
  whisper: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      adminCommandsServerObject.fakeMessage({
        message: props.slice(1, props.length).join(" "),
        color: "green",
        name: "Admin Commands " + msg.username + " whispers to you:",
      });
    }
    return { hidden: true };
  },
  talkUser: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      var data = {
        username: usernameInputElement.value,
        profile: window.profilePicture,
        message: props.slice(1, props.length).join(" "),
        ip: window.currentIP,
        room: window.server,
        color: window.usercolor,
        activated: msg.activated,
      };
      window.websocket.send(JSON.stringify(data));
    }
  },
  /*skewX: function (props) {
    document.body.style.transform =
      "skewX(" + props[0] + "deg)";
  },
  skewY: function (props) {
    document.body.style.transform =
      "skewY(" + props[0] + "deg)";
  },
  rotate: function (props) {
    document.body.style.transform =
      "rotate(" + props[0] + "deg)";
  },*/
  america: function () {
    var audio = new Audio(
      "https://cdn.glitch.global/7d821ad1-bb4a-4c14-9643-218271a015be/Eagle%20earrape.mp3?v=1693684268083",
    );
    audio.play();
  },
  hungry: function () {
    var audio = new Audio(
      "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/hungry.wav?v=1711839410318",
    );
    audio.play();
  },
  IP: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      adminCommandsServerObject.fakeMessage({
        message: "Pulling " + props[0] + "'s" + " ip address...",
        color: "red",
        name: "Admin Commands",
      });
      fetch("https://api.ipify.org?format=json").then((data) => {
        data.json().then((data) => {
          adminCommandsServerObject.fakeMessage({
            message: "i have your ip! " + data.ip,
            color: "red",
            name: "Admin Commands",
          });
        });
      });
    }
  },
  /*errors: function (props, msg) {
    if (getIsUserFromValue(props[0], msg)) {
      var bsodStopped = true;
      function e() {
        if (bsodStopped) {
          var audio = new Audio(
            "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/windows-xp-error-sound-effect-made-with-Voicemod.mp3?v=1714151699775"
          );
          audio.play();
          var img = document.createElement("img");
          document.body.appendChild(img);
          img.src =
            "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/dee38e10-db68-462d-9df7-46b87d4c7876/dd5co4x-8bf0ba3e-aace-4a25-9a10-8a9a6cc921a3.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2RlZTM4ZTEwLWRiNjgtNDYyZC05ZGY3LTQ2Yjg3ZDRjNzg3NlwvZGQ1Y280eC04YmYwYmEzZS1hYWNlLTRhMjUtOWExMC04YTlhNmNjOTIxYTMucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.llzSg9QgVDj8yeLQioOY5TyTQG7vsAnlQqQ6Jqa-R4c";
          img.style.position = "fixed";
          img.style.top = Math.random() * 100 + "%";
          img.style.left = Math.random() * 100 + "%";
          document.onclick = function (e) {
            e.preventDefault();
            var bsod = document.createElement("img");
            bsod.src =
              "https://upload.wikimedia.org/wikipedia/commons/a/a8/Windows_XP_BSOD.png?20081223003530";
            bsod.style.top = "0";
            bsod.style.left = "0";
            bsod.style.position = "fixed";
            bsod.style.width = "100%";
            bsod.style.height = "100vh";
            document.body.appendChild(bsod);
            setTimeout(() => {
              window.location.reload();
            }, 1000);
            bsodStopped = false;
          };
          setTimeout(e, 1);
        }
      }
      setTimeout(e, 1);
    }
  },*/
};
function runCommand(data, messageData, execute) {
  var cmdName = data[0];
  if (window.commands[cmdName]) {
    var willRun = true;
    if (window.safeCommands.indexOf(cmdName) < 0) {
      willRun = false;
    }
    if (messageData.activated) {
      willRun = true;
    }
    if (willRun) {
      try {
        var d = window.commands[cmdName](
          data.splice(1, data.length),
          messageData,
          execute,
        );
        return d;
      } catch (e) {
        adminCommandsServerObject.fakeMessage({
          message: `Admin commands encountered an error trying to run command "${cmdName}". ${e}`,
          color: "green",
          name: "Admin Commands",
        });
      }
    } else {
      if (usernameInputElement.value == messageData.username) {
        adminCommandsServerObject.fakeMessage({
          message:
            "Sorry... This command you can't use because your chat is not activated with the password, please activate your chat by password to use this.",
          color: "red",
          name: "Admin Commands",
        });
      }
    }
  } else {
    adminCommandsServerObject.fakeMessage({
      message:
        "Command not found, remember that the command names are case-sensitive",
      color: "red",
      name: "Admin Commands",
    });
  }
}
var allowedCommandUsers = ["gvbvdxx", "macre", "eli_"];
function doCommand(data) {
  if (!data) {
    return;
  }
  if (!data.message) {
    return;
  }
  var commandString = data.message.trim();
  if (commandString[0] == ">" || commandString[0] == ";") {
    if (window.adminCommandsMuted) {
      adminCommandsServerObject.fakeMessage({
        message: "Sorry, it seems like you can't use commands.",
        color: "red",
        name: "Admin Commands",
      });
    } else {
      var commandData = commandString.slice(1, commandString.length);
      var extractedCommandData = commandData.split(" ");
      return runCommand(extractedCommandData, data);
    }
  }
}
var spamTimes = 0;
function spamPretecton(data) {
  spamTimes += 1;
  setTimeout(() => {
    spamTimes = 1;
  }, 1000);
  if (spamTimes > 4) {
    if (data.username == usernameInputElement.value) {
      adminCommandsServerObject.sendMessage({
        message:
          usernameInputElement.value + " has been kicked because of spam.",
        color: "red",
        name: "Admin Commands",
      });
      window.websocket.close();
      window.location.reload();
    }
  }
}
window.onmessage = function (data) {
  return doCommand(data);

  //spamPretecton(data);
};
setInterval(() => {}, 1);
