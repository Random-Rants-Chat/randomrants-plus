var utils = require("./colors.js");
var fs = require("fs");

var cssVarsString = fs.readFileSync("./cssvars.txt").toString();
cssVarsString = cssVarsString.trim();

var varsSplit = cssVarsString.split("\n");
varsSplit = varsSplit.map((a) => {
  return a.trim();
});

varsSplit = varsSplit.map((variable) => {
  if (variable.indexOf("#") > -1) {
    var values = variable.slice(0, variable.length - 1).split("#");
    var hsl = utils.hexToHsl("#" + values[1]);
    if (hsl) {
      var h = `${hsl.h}`;
      var s = `${hsl.s}%`;
      var l = `${hsl.l}%`;

      if (h == "0" && s == "0%") {
        h = "var(--accent-default-hue)";
        s = "var(--accent-default-saturation)";
      }

      values[1] = `hsl(${h}, ${s}, ${l})`;
      variable = values.join("") + ";";
      console.log(hsl);
    }
  }
  if (variable.indexOf("background") > -1 || variable.indexOf("color") > -1) {
    variable = variable.replaceAll(
      "white",
      "hsl(var(--accent-default-hue), var(--accent-default-saturation), 100%)"
    );
    variable = variable.replaceAll(
      "black",
      "hsl(var(--accent-default-hue), var(--accent-default-saturation), 0%)"
    );
  }
  return variable;
});

var final = varsSplit.join("\n");

fs.writeFileSync("./cssvars-output.css", final);
