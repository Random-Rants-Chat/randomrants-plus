var elements = require("../../gp2/elements.js");
var currentRoom = require("./getroom.js");
var accountHelper = require("../../accounthelper");

var randomTexts = require("../../randomdialog.txt");
var randomTextsArray = randomTexts.split("\n");

var rrLoadingScreenText = elements.getGPId("rrLoadingScreenText"); //Gets the loading screen text element.
var randomFactSpan = elements.getGPId("randomFactSpan");

var loadingScreenTextScroll = [
  //Not putting them in TXT files just because lazy.
  "Random Rants+ is summoning chaos. Please stand by.",
  "Loading mayhem... please wait responsibly.",
  "Bringing the nonsense online. Hold tight.",
  "Please wait while Random Rants+ bootlegs itself into existence.",
  "Loading: This might take a moment—or an eternity.",
  "Booting up the nonsense core...",
  "Starting the digital hallway fight...",
  "Summoning Jason Touch… cross your fingers.",
  "Randomizing the room names and chaos seed…",
  "We're still pretending this is productive. Hang on.",
  "Synchronizing with school Wi-Fi chaos matrix...",
  "Deploying noise. Brace yourself.",
  "Converting focus time into distraction fuel...",
  "Injecting memes into the HTML...",
  "Starting background chaos...",
  "Loading jokes that might get you detention...",
  "Loading... because instant chaos is too powerful.",
  "Loading mysterious glitch energy...",
  "Loading voice chat mayhem...",
  "Loading soundboard spam...",
  "Loading volume over 9000...",
  "Injecting Random into the Rants... almost there.",
  "Loading highly unstable soundboard physics...",
  "Injecting unfiltered hallway drama into RAM...",
  "Enabling turbo-mic mode... scream responsibly.",
  "Generating ‘totally normal’ AI characters...",
  "Stabilizing your friend's laggy potato Chromebook...",
  "Connecting to school Wi-Fi... success? (somehow)",
  "Buffering... because someone opened 9 tabs of YouTube and RR+.",
  "Calibrating chaos engine... please wear headphones.",
  "Unleashing forbidden bracket codes...",
  "Reanimating crashed tabs from the void...",
  "Running on caffeine, memes, and spaghetti code...",
  "Summoning a room full of people who forgot headphones.",
  "Loading chat history with 237 unhinged arguments...",
  "Uploading all known ways to break ;crashTab...",
  "Installing updates for a Chromebook from 2012...",
  "Detecting a teacher. Activating stealth mode.",
  "Fusing school fights with low-res video feeds...",
  "Loading 47 people all trying to spam ;shake at once...",
  "Enabling background chaos even with the lid closed...",
  "Fetching the most cursed camera feeds known to man...",
  "Merging duplicate usernames into one chaotic being...",
  "Reviving crashed logs just to crash again...",
  "Converting keyboard rage into network packets...",
  "Finding the exact moment the mic peaked the loudest...",
  "Aligning the vibe satellites for maximum absurdity...",
  "Downloading memes with questionable educational value...",
  "Launching RR+ on a printer. Why not?",
  "Compiling 800 sound effects into one audio spike...",
  "Holding onto your sanity… failed.",
  "Making Random Rants + even more unhinged...",
  "Trying not to stream your homework folder...",
  "Deploying screen-sharing goblins 👾",
  "Loading code created with school glue...",
  "Making sure your Chromebook is not ready for this...",
  "Loading a 480p video file for no reason...",
  "Talking to ChatGPT about what is going on here...",
  "Getting ready to fry your Chromebooks speakers...",
  "Spawning chaos gremlins into your audio channel...",
  "Buffering sarcasm. Please maintain eye rolls.",
  "Temporarily disabling logic for optimal nonsense...",
  "Converting hallway echoes into stereo lag...",
  "Assembling the digital lunch table gossip...",
  "Ping-ponging your mic input through 5 servers...",
  "Stuck in a boot loop of pure randomness...",
  "Loading glitchy bracket codes from the void...",
  "Rebooting the chaos capacitor… please wait.",
  "Synchronizing chat delay with real-time drama...",
  "Injecting cursed memes into the data stream...",
  "Translating hallway energy into voice distortion...",
  "Preloading 10,000 soundboard taps. Sorry in advance.",
  "Simulating productive learning... failed.",
  "Connecting your signal through 17 VPN tunnels...",
  "Scrambling usernames for maximum confusion...",
  "Activating advanced drama rendering system...",
  "Decoding lag into a new language...",
  "Waiting for your Chromebook to remember how to Wi-Fi...",
  "Detecting unauthorized vibes… ignoring them.",
  "Mapping the emotional range of ;uh...",
  "Preloading arguments from last period...",
  "Overheating the nonsense engine… cooling down...",
  "Detecting loudest possible soundboard combo...",
  "Attempting to render chaos in 144p...",
  "Disabling common sense module...",
  "Summoning ‘that one kid’ who never mutes...",
  "Connecting voice lag to your camera for extra spice...",
  "Training AI to argue with itself...",
  "Embedding chaos into the browser cache...",
  "Casting screen-sharing spells... backfired.",
  "Launching in debug mode: chaos only.",
  "Assigning vibe roles based on profile pics...",
  "Installing the ‘make everything weird’ plugin...",
  "Preparing your ears for sonic destruction...",
  "Compiling chat energy into glitch packets...",
  "Activating hallway simulator in surround sound...",
  "Slicing chaos into streamable packets...",
  "Resetting user logic... loading nonsense instead...",
  "Installing invisible lag traps...",
  "Setting max decibels to ‘someone sneezed into the mic’...",
  "Converting spilled juice on the keyboard into bugs...",
  "Unmuting everyone at once... oh no.",
  "Resurrecting old group chats for chaos nostalgia...",
  "Preparing a surprise popcat ambush...",
  "Replacing silence with awkward digital stares...",
  "Injecting extra milliseconds of voice delay...",
  "Analyzing keyboard rage patterns...",
  "Connecting chaos to the nearest available speaker...",
  "Installing meme drivers… please don’t unplug.",
  "Downloading update: adds more glitches than it fixes...",
  "Installing virtual desks... upside down.",
  "Scanning for chaos updates... found too many.",
  "Preloading accidental mic moments...",
  "Patching a bug that made everyone too normal...",
  "Disabling firewall against fun...",
  "Retuning chaos to match your mood swings...",
  "Adding 2% logic. System rejected it.",
  "Rewiring the vibe frequency...",
  "Preparing to overload your notifications...",
  "Unlocking new levels of classroom drama...",
  "Reconfiguring chaos levels to 'lunchtime mode'...",
  "Linking you to the closest chaotic neutral peer...",
  "Desyncing messages for comedic effect...",
  "Polishing randomizer with existential dread...",
  "Auto-generating homework excuses...",
  "Attempting to stabilize the meme flux capacitor...",
  "Alert: Someone just triggered ;popcat 300 times.",
  "Activating anti-focus field...",
  "Catching up to 74 missed messages from 2 minutes ago...",
  "Simulating a group project where no one contributes...",
  "Loading... but with extra reverb.",
  "Generating random usernames like 'xX_Rants420_Xx'...",
  "Applying duct tape to your digital classroom...",
  "Your Chromebook might melt. We’re not sorry.",
  "Adding 300ms lag to simulate real classroom chaos...",
  "Replacing your toolbar with chaos buttons...",
  "Tracking how fast the teacher says 'mute yourself'...",
  "Importing classroom gossip from adjacent servers...",
  "Spinning up virtual chaos hamsters...",
  "Executing random command: ;spin ;shake ;crashTab ;uh...",
  "Generating a new vibe… it’s unstable.",
  "Compiling everyone's mic static into white noise...",
  "Uploading all known cat noises to the soundboard...",
  "Turning up the gain... too late.",
  "Analyzing pixelated video feed for chaos signals...",
  "Loading an update that just adds more confusion...",
  "Channeling chaotic energy from nearby Chromebooks...",
  "Injecting just enough lag to ruin the timing...",
  "Applying glitch filter to the chat history...",
  "Slapping the server until it obeys...",
  "Encoding the entire session in 'vibe-only' mode...",
  "Encrypting your sarcasm... decrypted instantly.",
  "Bridging the gap between logic and whatever this is...",
  "Connecting your brain to the chaos cloud...",
  "Adding extra chaos to your clipboard...",
  "Compiling code made entirely of inside jokes...",
  "Trying to make sense of the soundboard... failed.",
  "Pouring energy drink into the server ports...",
  "Spawning a second version of you with a louder mic...",
  "Replaying the most cursed sound from memory...",
  "Starting cursed screen-share session...",
  "Sharing screen... and all your tabs accidentally.",
  "Projecting chaos to the entire room...",
  "Enabling 144p resolution for maximum confusion...",
  "Streaming your desktop... including your weird folder names.",
  "Starting screen-share: viewer discretion advised.",
  "Buffering cursed images… please enjoy responsibly.",
  "Sharing your screen and your secrets...",
  "Broadcasting your lag in real time...",
  "Activating screen-share... now everyone sees the chaos.",
  "Transmitting pixels cursed beyond repair...",
  "Streaming chaos in slideshow mode...",
  "Warning: your screen-share is now everyone's business.",
  "Converting your screen into a chaos beacon...",
  "Sharing your screen... accidentally showing 27 tabs.",
  "Opening screen-share… and unleashing visual noise.",
  "Sharing cursed spreadsheets and forbidden tabs...",
  "Starting screen-share: all typos now public.",
  "Screen-share initiated: hope you closed your memes folder.",
  "Launching screen-share… forgot to mute? Too late.",
  "Screen-share live! Immediately regrets everything.",
  "Transmitting forbidden vibes through your screen...",
  "Screen-sharing lag: now in HD!",
  "Showing everyone how scuffed your desktop really is...",
  "Summoning the ancient artifact known as 'My Screen'...",
  "Starting screen-share… sorry in advance.",
  "Casting cursed Chrome tabs into the void...",
  "Warning: screen-share may cause emotional damage.",
  "Streaming your screen at 1 frame per minute...",
  "Sharing screen… now everyone sees your math mistakes.",
  "Opening GVBPaint... someone's already drawing a Shrek with laser eyes.",
  "Loading cursed masterpieces from 7 different mice...",
  "Summoning shared canvas chaos...",
  "Drawing tools enabled... please use irresponsibly.",
  "GVBPaint is live — now featuring 98% chaos, 2% art.",
  "Collaborative doodling has entered the chat.",
  "Someone just filled the entire canvas with red. Again.",
  "Loading GVBPaint... eraser wars in progress.",
  "Preparing canvas for the next unholy scribble...",
  "Warning: collaborative art may cause regret.",
  "Initializing MS Paint energy with multiplayer mayhem...",
  "Synchronizing chaotic brushstrokes...",
  "Drawing live with 12 people and zero artistic restraint...",
  "GVBPaint canvas found: it's already cursed.",
  "Loading shared drawing... who drew the Among Us again?",
  "Unleashing synchronized scribbles...",
  "Fetching all known inappropriate doodles...",
  "Initializing: one canvas, infinite chaos.",
  "Someone just drew something so cursed, we’re buffering.",
  "Drawing tools syncing... get ready to overwrite each other."
];

function returnRandomValueFromArray(array) {
  return array[Math.round(Math.random() * (array.length - 1))];
}

function loopAnimation() {
  var anim = randomFactSpan.animate(
    [{ opacity: "1" }, { opacity: "0", transform: "translateY(-10px)" }],
    {
      duration: 350,
      iterations: 1,
      easing: "ease-out",
    }
  );

  anim.addEventListener("finish", () => {
    rrLoadingScreenText.textContent = returnRandomValueFromArray(
      loadingScreenTextScroll
    );
    var anim2 = rrLoadingScreenText.animate(
      [{ opacity: "0", transform: "translateY(10px)" }, { opacity: "1" }],
      {
        duration: 350,
        iterations: 1,
        easing: "ease-out",
      }
    );

    anim2.addEventListener("finish", () => {
      setTimeout(loopAnimation, 2500);
    });
  });
}

loopAnimation();

function loopAnimation2() {
  var anim = randomFactSpan.animate(
    [{ opacity: "1" }, { opacity: "0", transform: "translateY(-6px)" }],
    {
      duration: 400,
      iterations: 1,
      easing: "ease-out",
    }
  );

  anim.addEventListener("finish", () => {
    randomFactSpan.textContent =
      returnRandomValueFromArray(randomTextsArray).trim();
    var anim2 = randomFactSpan.animate(
      [{ opacity: "0", transform: "translateY(6px)" }, { opacity: "1" }],
      {
        duration: 400,
        iterations: 1,
        easing: "ease-out",
      }
    );

    anim2.addEventListener("finish", () => {
      setTimeout(loopAnimation2, 3000);
    });
  });
}

loopAnimation2();
