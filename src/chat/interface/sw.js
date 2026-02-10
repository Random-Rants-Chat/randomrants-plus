//not the actual service worker, just something to display the prompt and activate.
var elements = require("../../gp2/elements.js");
var accountHelper = require("../../accounthelper/index.js");
var dialogs = require("../../dialogs.js");
var notify = require("./notify.js");
var session = accountHelper.getCurrentValidationState();
var ASK_STORAGE_ID = "pushNotificationsDialogNoShow";

var activatePushDialog = elements.getGPId("activatePushDialog");
var activatePushButton = elements.getGPId("activatePushButton");
var pushPromptCloseButton = elements.getGPId("pushPromptCloseButton");
var pushPromptCloseButtonNoShow = elements.getGPId("pushPromptCloseButtonNoShow");

(async function () {
  if (session) {
    try{
      await accountHelper.pushNotificationHelper.register();
    }catch(e){}

    var subscription = null;
    try{
      subscription = await accountHelper.pushNotificationHelper.getSubscription();
    }catch(e){}

    if (!subscription) {
      if (!localStorage.getItem(ASK_STORAGE_ID)) {
        activatePushDialog.hidden = false;
        var subscribing = false;
        async function startSubscribeProcess() {
          if (subscribing) {
            return;
          }
          subscribing = true;
          activatePushButton.textContent = "Now click the *real* allow button!";
          try{
            await notify.requestPermission();
            activatePushButton.textContent = "Subscribing to push notifications...";
            await accountHelper.pushNotificationHelper.subscribe(true);
            activatePushDialog.hidden = true;
            dialogs.alert("Registered push notification subscription successfully!");
          }catch(e){
            dialogs.alert("Couldn't subscribe to push notifications, click to try again. Error message: "+e);
            console.error(e);
          }
          activatePushButton.textContent = "Click to try subscribing again";
          subscribing = false;
        }

        activatePushButton.addEventListener("click", () => {
          startSubscribeProcess();
        });
        pushPromptCloseButton.addEventListener("click", () => {
          activatePushDialog.hidden = true;
        });
        pushPromptCloseButtonNoShow.addEventListener("click", () => {
          activatePushDialog.hidden = true;
          localStorage.setItem(ASK_STORAGE_ID, "true");
        });
      }
    } else {
      localStorage.removeItem(ASK_STORAGE_ID);
      await notify.requestPermission();
    }

  }
})();