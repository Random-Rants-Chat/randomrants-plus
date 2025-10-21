async function fetchAsJSON(url, options) {
  var a = await fetch(url, options);
  var b = await a.json();

  return b;
}

async function fetchAsText(url, options) {
  var a = await fetch(url, options);
  var b = await a.text();

  return b;
}

async function fetchAsBlob(url, options) {
  var a = await fetch(url, options);
  var b = await a.blob();

  return b;
}

async function fetchAsArrayBuffer(url, options) {
  var a = await fetch(url, options);
  var b = await a.arrayBuffer();

  return b;
}

module.exports = {
  fetchAsJSON,
  fetchAsText,
  fetchAsBlob,
  fetchAsArrayBuffer,
  fetch,
};
