var fs = require("fs");
var path = require("path");
var { generateCode, generateImage } = require("./bot-check.js");

const ROBOT_CHECK_IMAGE_DIR = "./robotcheck";
const ROBOT_CHECK_TIMEOUT = 1000 * 60 * 3; //3 minutes

try {
  fs.rmSync(ROBOT_CHECK_IMAGE_DIR, { directory: true, recursive: true });
} catch (e) {}
try {
  fs.mkdirSync(ROBOT_CHECK_IMAGE_DIR);
} catch (e) {
  console.log("Failed to make robot check image directory." + e);
}

var allIncomingRobotTests = {};

function generateIncomingRobotTestID(randomLength = 8) {
  var timeComponent = Date.now().toString(36);
  var safeCharacters = "23456789abcdefghijkmnpqrstuvwxy";
  var randomComponent = "";

  for (var i = 0; i < randomLength; i++) {
    const randomIndex = Math.floor(Math.random() * safeCharacters.length);
    randomComponent += safeCharacters.charAt(randomIndex);
  }
  return `${timeComponent}z${randomComponent}`;
}

class IncomingRobotTest {
  constructor(id) {
    this.id = id;
    allIncomingRobotTests[this.id] = this;
    this.code = generateCode();
    this.passed = false;
    this.resetTimeout();
  }

  didPass() {
    this.destroy();
    return this.passed;
  }

  check(checkCode) {
    if (this.passed) {
      return false;
    }
    if (this.code == checkCode) {
      this.passed = true;
      this.resetTimeout();
      return true;
    }
    this.destroy();
    return false;
  }

  serveImage(res) {
    if (fs.existsSync(this.imagePath)) {
      res.setHeader("Content-Type", "image/jpeg");
      fs.createReadStream(this.imagePath).pipe(res);
    } else {
      res.statusCode = 404;
      res.end("Unable to find the image file");
    }
  }

  async generateImage() {
    this.imagePath = path.join(ROBOT_CHECK_IMAGE_DIR, this.id);
    fs.writeFileSync(this.imagePath, await generateImage(this.code));
  }

  resetTimeout() {
    clearTimeout(this.timeout);
    var _this = this;
    this.timeout = setTimeout(() => {
      _this.destroy();
    }, ROBOT_CHECK_TIMEOUT);
  }

  destroy() {
    delete allIncomingRobotTests[this.id];
    this.id = null;
    this.code = null;
    if (this.imagePath) {
      if (fs.existsSync(this.imagePath)) {
        fs.rmSync(this.imagePath);
      }
    }
    this.imagePath = null;
    clearTimeout(this.timeout);
    this.timeout = null;
  }
}

async function createRobotTest() {
  var id = generateIncomingRobotTestID();
  var test = new IncomingRobotTest(id);
  await test.generateImage();
  return {
    id,
  };
}

function didPassCheck(id) {
  var test = allIncomingRobotTests[id];
  if (test) {
    return test.didPass();
  }
  return false;
}

function serveRobotTestImage(id, res) {
  if (id.length > 0) {
    var test = allIncomingRobotTests[id];
    if (test) {
      return test.serveImage(res);
    } else {
      res.statusCode = 400;
      res.end("Unable to find this robot test ID.");
    }
  } else {
    res.statusCode = 400;
    res.end("Check ID must be at least one character long.");
  }
}

function sendCheck(id, checkCode) {
  var test = allIncomingRobotTests[id];
  if (test) {
    return test.check(checkCode);
  }
  return false;
}

module.exports = {
  generateIncomingRobotTestID,
  createRobotTest,
  didPassCheck,
  serveRobotTestImage,
  sendCheck,
};
