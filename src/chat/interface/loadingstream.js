var loadingCVS = document.createElement("canvas");
var loadingCTX = loadingCVS.getContext("2d");
var img = document.createElement("img");
img.onload = function () {
  loadingCVS.width = this.width * 2;
  loadingCVS.height = this.height * 2;
  loadingCTX.fillStyle = "black";
  loadingCTX.fillRect(0, 0, this.width, this.height);
  loadingCTX.drawImage(
    this,
    this.width / -2 + loadingCVS.width / 2,
    this.height / -2 + loadingCVS.height / 2,
    this.width,
    this.height,
  );
};
img.src = "images/webrtc-loading.svg";

var loadingStream = loadingCVS.captureStream(60);

module.exports = loadingStream;
