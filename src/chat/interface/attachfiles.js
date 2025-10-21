var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");
var accountHelper = require("../../accounthelper");

var messageAttachFilesButton = elements.getGPId("messageAttachFilesButton");
var messageInputBox = elements.getGPId("messageInputBox");

var uploadFileAsURL = require("./uploadfiles.js");

var ogAttachText = messageAttachFilesButton.innerHTML;
messageAttachFilesButton.addEventListener("click", async function () {
  var buttonChoose = await dialogs.displayButtonChooser(
    "What type of file do you want to attach?",
    ["Cancel", "Image", "Audio", "Video", "File download link"],
  );

  var acceptTypes = "";

  if (buttonChoose == 0) {
    return;
  }
  if (buttonChoose == 1) {
    acceptTypes = "image/*";
  }
  if (buttonChoose == 2) {
    acceptTypes = "audio/*";
  }
  if (buttonChoose == 3) {
    acceptTypes = "video/*";
  }
  if (buttonChoose == 4) {
    acceptTypes = "";
  }

  var input = document.createElement("input");
  input.onchange = async function () {
    if (input.files[0]) {
      messageAttachFilesButton.disabled = true;
      messageAttachFilesButton.textContent = "0/" + input.files.length;
      var fileCount = 0;
      for (var file of input.files) {
        try {
          var fileurl = await uploadFileAsURL(file);
          if (buttonChoose == 1) {
            messageInputBox.value += `[image url=${fileurl}]`;
          }
          if (buttonChoose == 2) {
            messageInputBox.value += `[audio url=${fileurl}]`;
          }
          if (buttonChoose == 3) {
            messageInputBox.value += `[video url=${fileurl}]`;
          }
          if (buttonChoose == 4) {
            if (!messageInputBox.value.endsWith(" ")) {
              messageInputBox.value += " ";
            }
            messageInputBox.value += fileurl;
          }
        } catch (e) {
          dialogs.alert("Failed to upload file: " + e);
        }
        fileCount += 1;
        var amount = fileCount + 1 + "/" + input.files.length;
        messageAttachFilesButton.textContent = amount;
      }
      messageAttachFilesButton.disabled = false;
      messageAttachFilesButton.innerHTML = ogAttachText;
    }
    input.remove();
  };
  input.type = "file";
  input.accept = acceptTypes;
  input.multiple = true;
  input.click();
});
