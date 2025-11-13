function addScript(src) {
  return new Promise((accept, reject) => {
    var script = document.createElement("script");
    script.src = src;
    script.onload = accept;
    script.onerror = reject;
    document.body.append(script);
  });
}

module.exports = addScript;
