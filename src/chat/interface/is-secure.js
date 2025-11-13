module.exports = function isSecure() {
  var urlinfo = new URL(window.location.href);
  if (urlinfo.protocol == "https:") {
    return true;
  }
  return false;
};
