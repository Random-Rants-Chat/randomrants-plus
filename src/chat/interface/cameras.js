var cameras = {};


var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");

var cameraVideosDiv = elements.getGPId("camerasVideosDiv");

function createCameraVideoDiv() {
  var div = document.createElement("div");
  var video = document.createElement("video");
  var displayNameSpan = document.createElement("span");
  
  div.className = "cameraVideo";
  video.className = "cameraVideoElement";
  displayNameSpan.className = "cameraVideoUsername";
  
  div.append(video);
  div.append(displayNameSpan);
    
  return {div,video,displayNameSpan};
}

var cameraVideos = {};

cameras.show = function (id,code,displayName,userColor) {
  var ssc = window.screenShareClient;
  if (ssc) {
    if (cameraVideos[id]) {
      cameras.hide(id);
    }
    var cameraVideo = {};
    var elms = createCameraVideoDiv();
    cameraVideo.elms = elms;
    elms.displayNameSpan.textContent = displayName;
    if (userColor) {
      elms.displayNameSpan.style.color = userColor;
    }
    
    cameraVideosDiv.append(elms.div);
    
    cameraVideo.ss = window.screenShareClient.connectTo(
      code,
      true,
      function (stream) {
        elms.video.srcObject = stream;
        elms.video.muted = true;
        elms.video.play();
      },
      () => {
        
      }
    );
    
    cameraVideos[id] = cameraVideo;
    
  }
};

cameras.hide = function (id) {
  var ssc = window.screenShareClient;
  if (ssc) {
    if (!cameraVideos[id]) {
      return;
    }
    var cameraVideo = cameraVideos[id];
    
    try{
      cameraVideo.ss.closeConnection();
    }catch(e){}
    
    cameraVideo.elms.video.pause(); //Pause video.
    
    //Remove the src object and other stuff.
    cameraVideo.elms.video.removeAttribute('src'); // empty source
    cameraVideo.elms.video.srcObject = null;
    cameraVideo.elms.video.load();
    
    //To avoid memory leaks, all elements will be removed.
    cameraVideo.elms.video.remove();
    cameraVideo.elms.displayNameSpan.remove();
    cameraVideo.elms.div.remove();
    
    //Dispose of the cameraVideo.
    cameraVideos[id] = undefined;
    
    //Just to make sure its actually disposed, filter out any empty values in cameraVideos.
    var newObjects = {};
    for (var id of Object.keys(cameraVideos)) {
      if (cameraVideos[id]) {
        newObjects[id] = cameraVideos[id];
      }
    }
    cameraVideos = newObjects;
  }
};

cameras.hideAll = function () {
  for (var cameraID of Object.keys(cameraVideos)) {
    cameras.hide(cameraID);
  }
};

module.exports = cameras;