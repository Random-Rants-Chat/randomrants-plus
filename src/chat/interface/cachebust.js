var cacheBuster = "?v=" + Date.now();

function cacheBust(url) {
  return url + cacheBuster;
}

module.exports = cacheBust;
