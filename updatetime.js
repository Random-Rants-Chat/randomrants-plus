const fs = require("fs");
const path = require("path");

const outPath = path.resolve(__dirname, "wpstatic/version.json");
fs.writeFileSync(
  outPath,
  JSON.stringify({ timestamp: Date.now().toString() }),
  "utf-8"
);
