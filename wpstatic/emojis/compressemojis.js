var fs = require("fs");
var file = "data-by-group.json";
fs.writeFileSync(
  file,
  JSON.stringify(JSON.parse(fs.readFileSync(file).toString("UTF-8"))),
  "UTF-8"
);
console.log("Compressed emojis to minimal size");

var file = "rantemojis.json";
fs.writeFileSync(
  file,
  JSON.stringify(
    JSON.parse(fs.readFileSync(file).toString("UTF-8")),
    null,
    "  "
  ),
  "UTF-8"
);
console.log("Rant emojis beautified");
