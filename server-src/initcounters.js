var fs = require("fs");
var path = require("path");

if (!fs.existsSync("./counters/")) {
  fs.mkdirSync("./counters/"); //Forgot to add this.
  //Add counter files:
  fs.writeFileSync("./counters/rooms.json", JSON.stringify({"count":0}));
}