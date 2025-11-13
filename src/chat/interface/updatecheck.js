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
  },
};

var updateScreenDiv = elements.getGPId("rrUpdateScreen");
var updateVersionTime = elements.getGPId("updateVersionTime");

function formatTimeDifference(oldTimestamp, newTimestamp) {
  let diffMs = Math.abs(newTimestamp - oldTimestamp);

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365);

  if (years > 0) return years + " year" + (years > 1 ? "s" : "");
  if (days > 0) return days + " day" + (days > 1 ? "s" : "");
  if (hours > 0) return hours + " hour" + (hours > 1 ? "s" : "");
  if (minutes > 0) return minutes + " minute" + (minutes > 1 ? "s" : "");
  return seconds + " second" + (seconds !== 1 ? "s" : "");
}

async function getVersion() {
  try {
    var versionInfo = await fetchUtils.fetchAsJSON("/client/version");
    return versionInfo.timestamp;
  } catch (e) {
    return null;
  }
}
async function getServerTime() {
  try {
    var versionInfo = await fetchUtils.fetchAsJSON("/client/time");
    return versionInfo.serverTime;
  } catch (e) {
    return null;
  }
}

(async function () {
  updateChecker.currentVersion = await getVersion();

  async function checkUpdate() {
    const newVersion = await getVersion();
    const serverTime = await getServerTime();
    if (!newVersion) {
      return;
    }
    if (!serverTime) {
      return;
    }
    if (newVersion !== updateChecker.currentVersion) {
      updateChecker.needsUpdate = true;
      updateScreenDiv.hidden = false;
      updateVersionTime.textContent = formatTimeDifference(
        Number(newVersion),
        Number(serverTime),
      );

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
      if (!updateChecker.needsUpdate) {
        checkUpdate(); //Double check just to make sure.
      }
    }
  });

  updateChecker.updateInterval = setInterval(checkUpdate, jitter + 15000);
})();

module.exports = updateChecker;
