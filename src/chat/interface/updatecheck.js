var elements = require("../../gp2/elements.js");
var fetchUtils = require("./fetchutils.js");

var jitter = Math.random() * 3000;

var updateChecker = {
  currentVersion: "0",
  needsUpdate: false,
  updateListeners: {},
  addUpdateListener: function (id, funct) {
    this.updateListeners[id] = funct;
  },
  removeUpdateListener: function (id) {
    delete this.updateListeners[id];
  }
};

var updateScreenDiv = elements.getGPId("rrUpdateScreen");

async function getVersion () {
  try {
    var versionInfo = await fetchUtils.fetchAsJSON("/version.json");
    return versionInfo.timestamp;
  } catch (e) {
    return null;
  }
}

(async function () {
  updateChecker.currentVersion = await getVersion();
  
  async function checkUpdate () {
    const newVersion = await getVersion();
    if (!newVersion) {
      return;
    }
    if (newVersion !== updateChecker.currentVersion) {
      updateChecker.needsUpdate = true;
      updateScreenDiv.hidden = false;

      for (const key in updateChecker.updateListeners) {
        const listener = updateChecker.updateListeners[key];
        if (typeof listener === "function") {
          listener();
        }
      }

      clearInterval(updateChecker.updateInterval);
    }
  }
  
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      // Tab became active again — check immediately
      checkUpdate();
    }
  });

  updateChecker.updateInterval = setInterval(checkUpdate, jitter + 15000);
})();

module.exports = updateChecker;
