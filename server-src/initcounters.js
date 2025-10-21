var fs = require("fs");
var path = require("path");

if (!fs.existsSync("./counters/")) {
  fs.mkdirSync("./counters/"); //Forgot to add this.
  //Add counter files:
  fs.writeFileSync(
    "./counters/rooms.json",
    JSON.stringify({ count: Math.round(Date.now()) }),
  ); //Count doesn't need to be accurate, its just used for room IDs to be unique.
}
