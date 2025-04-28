//Just a small script that updates the version.txt

var fs = require("fs");

fs.writeFileSync("./wpstatic/version.json",JSON.stringify({
  timestamp: Date.now().toString()
}),"UTF-8");