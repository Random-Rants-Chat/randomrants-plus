var fs = require("fs");
var path = require("path");

if (!fs.existsSync("./counters/")) {
  fs.writeFileSync("./counters/rooms.json", JSON.stringify({"count":0}));
}