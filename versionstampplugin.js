//Update the version before compiling.

const fs = require("fs");
const path = require("path");

const outPath = path.resolve(__dirname, "wpstatic/version.json");

class VersionUpdatePlugin {
  apply(compiler) {
    compiler.hooks.beforeCompile.tap("BeforeCompilePlugin", (params) => {
      console.log("Updating version timestamp file...");
      var timestamp = Date.now().toString();
      fs.writeFileSync(outPath, JSON.stringify({ timestamp }), "utf-8");
      console.log("Updated version timestamp to: " + timestamp);
    });
  }
}

module.exports = VersionUpdatePlugin;
