window.title = "Random Rants + | My account";

require("../cookiewarning");
require("./stylesheet.js");
var menuBar = require("../menu.js"); //Menu bar.
var elements = require("../gp2/elements.js"); //Based on gvbvdxx-pack-2's element module.
var accountHelper = require("../accounthelper/index.js");
var dialog = require("../dialogs.js");
var loader = require("./loadingscreen.js");
var fontList = require("../fontlist.js");
var colorSelect = require("../colorselect.js");
var fontSelect = require("../fontselect.js");
require("./navigate-loader.js");

function compressImage(oldsrc) {
  return new Promise((resolve, reject) => {
    const oldImg = document.createElement("img");
    oldImg.src = oldsrc;
    oldImg.onload = function () {
      try {
        const maxSize = 96;
        const cvs = document.createElement("canvas");
        const ctx = cvs.getContext("2d");

        // Calculate new dimensions preserving aspect ratio
        let newWidth, newHeight;
        const aspectRatio = oldImg.width / oldImg.height;

        if (aspectRatio > 1) {
          // Image is wider than tall
          newWidth = maxSize;
          newHeight = maxSize / aspectRatio;
        } else {
          // Image is taller than wide or square
          newHeight = maxSize;
          newWidth = maxSize * aspectRatio;
        }

        cvs.width = maxSize;
        cvs.height = maxSize;

        // Optional: clear canvas and fill with transparent background
        ctx.clearRect(0, 0, cvs.width, cvs.height);

        // Draw the resized image centered on the canvas
        const xOffset = (maxSize - newWidth) / 2;
        const yOffset = (maxSize - newHeight) / 2;
        ctx.drawImage(oldImg, xOffset, yOffset, newWidth, newHeight);

        // Get compressed image data URL as WebP with 50% quality
        const dataURL = cvs.toDataURL("image/webp", 0.5);

        // Clean up
        cvs.width = 1;
        cvs.height = 1;
        cvs.remove();

        resolve(dataURL);
      } catch (e) {
        reject("Got strange error when trying to resize image: " + e);
      }
    };
    oldImg.onerror = function () {
      reject(
        "Unable to load this image to compress and resize, maybe your browser doesn't support that format."
      );
    };
  });
}

(async function () {
  try {
    var session = await accountHelper.checkSessionCookie();

    if (session) {
      var userColor = session.color || "#000000";
      var elementJSON = [
        {
          element: "div",
          className: "centeredDialog",
          style: {
            backgroundColor: "white",
            borderRadius: "5px",
            padding: "15px 15px",
            boxShadow: "0px 0px 20px black",
            maxHeight: "calc(100vh - 100px)",
            maxWidth: "calc(100vw - 100px)",
            overflowY: "auto",
          },
          children: [
            require("./sitenews-notice.js"),
            {
              element: "span",
              style: {
                fontSize: "20px",
                fontWeight: "bold",
              },
              textContent: "Your Random Rants + account",
            },
            {
              element: "hr",
            },
            {
              element: "div",
              style: {
                display: "flex",
              },
              children: [
                {
                  element: "img",
                  style: {
                    outline: "none",
                    borderRadius: "64px",
                    borderStyle: "solid",
                    borderWidth: "3px",
                    borderColor: "#7d7d7d",
                    backgroundColor: "#969696",
                    imageRendering: "pixelated",
                    top: "0px",
                    width: "64px",
                    height: "64px",
                  },
                  gid: "profilePicture_account",
                },
                {
                  element: "div",
                  style: {
                    display: "flex",
                    flexDirection: "column",
                  },
                  children: [
                    {
                      element: "input",
                      style: {
                        alignContent: "center",
                        fontSize: "30px",
                        fontWeight: "bold",
                        color: userColor,
                        border: "none",
                        background: "none",
                        fontFamily: session.font,
                        width: "100%",
                      },
                      gid: "displayNameInput",
                      value: session.displayName,
                    },
                    {
                      element: "span",
                      style: {
                        alignContent: "center",
                        fontSize: "16px",
                        color: userColor,
                        padding: "3px 3px",
                        fontFamily: session.font,
                      },
                      gid: "usernameSpan",
                      textContent: session.username,
                    },
                  ],
                },
                {
                  element: "div",
                  style: {
                    width: "10px",
                  },
                },
                {
                  element: "div",
                  style: {
                    alignContent: "center",
                  },
                },
              ],
            },
            {
              element: "hr",
            },
            {
              element: "div",
              style: {
                display: "flex",
              },
              children: [
                {
                  element: "div",
                  className: "button",
                  gid: "changeDisplayNameButton",
                  style: {
                    flexGrow: "1",
                  },
                  children: [
                    {
                      element: "img",
                      src: "images/text.svg",
                      style: {
                        height: "17px",
                      },
                    },
                    {
                      element: "span",
                      textContent: "Change display name",
                    },
                  ],
                },
                {
                  element: "div",
                  className: "button",
                  gid: "changeDisplayNameFontButton",
                  style: {
                    width: "fit-content",
                  },
                  children: [
                    {
                      element: "img",
                      src: "images/text.svg",
                      style: {
                        height: "17px",
                      },
                    },
                    {
                      element: "span",
                      textContent: "Change font",
                    },
                  ],
                },
              ],
            },
            {
              element: "div",
              style: {
                display: "flex",
              },
              children: [
                {
                  element: "div",
                  className: "button",
                  gid: "uploadPFP",
                  style: {
                    flexGrow: "1",
                  },
                  children: [
                    {
                      element: "img",
                      src: "images/profile.svg",
                      style: {
                        height: "17px",
                      },
                    },
                    {
                      element: "span",
                      textContent: "Upload profile picture",
                    },
                  ],
                },
                {
                  element: "div",
                  className: "button",
                  style: {
                    width: "fit-content",
                  },
                  gid: "resetPFP",
                  children: [
                    {
                      element: "img",
                      src: "images/reload.svg",
                      style: {
                        height: "17px",
                      },
                    },
                    {
                      element: "span",
                      textContent: "Reset",
                    },
                  ],
                },
              ],
            },
            {
              element: "div",
              className: "button",
              gid: "selectUsernameColorButton",
              children: [
                {
                  element: "img",
                  src: "images/brush.svg",
                  style: {
                    height: "17px",
                  },
                },
                {
                  element: "span",
                  textContent: "Change username color",
                },
              ],
            },
            {
              element: "div",
              className: "button",
              gid: "changePasswordButton",
              children: [
                {
                  element: "img",
                  src: "images/key.svg",
                  style: {
                    height: "17px",
                  },
                },
                {
                  element: "span",
                  textContent: "Change password",
                },
              ],
            },
            {
              element: "div",
              className: "button",
              gid: "signOutButton",
              children: [
                {
                  element: "img",
                  src: "images/signout.svg",
                  style: {
                    height: "17px",
                  },
                },
                {
                  element: "span",
                  textContent: "Sign out",
                },
              ],
            },
            { element: "br" },
            {
              element: "div",
              className: "button",
              eventListeners: [
                {
                  event: "click",
                  func: function () {
                    window.location.href = "/chat";
                  },
                },
              ],
              children: [
                {
                  element: "img",
                  src: "images/chaticon.svg",
                  style: {
                    height: "17px",
                  },
                },
                {
                  element: "span",
                  textContent: "Start ranting!",
                },
              ],
            },
            {
              element: "br",
            },
            {
              element: "b",
              style: {
                color: "red",
              },
              textContent: "Dangerous actions:",
            },
            {
              element: "br",
            },
            {
              element: "div",
              className: "button",
              gid: "destroyAccountButton",
              children: [
                {
                  element: "img",
                  src: "images/redcancel.svg",
                  style: {
                    height: "17px",
                  },
                },
                {
                  element: "span",
                  textContent: "Deactivate account",
                },
              ],
            },
          ],
        },
      ];

      var pageElements = elements.createElementsFromJSON(elementJSON);
      elements.appendElements(elements.body, pageElements);

      var queryNumber = 0;
      var pfp = elements.getGPId("profilePicture_account");
      var selectUsernameColorButton = elements.getGPId(
        "selectUsernameColorButton"
      );
      var usernameSpan = elements.getGPId("usernameSpan");
      var changeDisplayNameButton = elements.getGPId("changeDisplayNameButton");
      var changeDisplayNameFontButton = elements.getGPId(
        "changeDisplayNameFontButton"
      );
      var displayNameInput = elements.getGPId("displayNameInput");
      var changePasswordButton = elements.getGPId("changePasswordButton");

      async function loadImage(imageFile) {
        var imgurl = accountHelper.getProfilePictureURL(session.username);
        try {
          for (var i = 0; i < 3; i++) {
            await fetch(imgurl, { cache: "reload", mode: "no-cors" });
          }
        } catch (e) {}
        if (imageFile) {
          pfp.src = imageFile;
        } else {
          pfp.src = imgurl;
        }
      }
      loadImage();

      changeDisplayNameFontButton.onclick = async function () {
        var selectedFont = await fontSelect.ask(
          [
            {
              name: "Arial",
              family: "Arial",
            },
            {
              name: "Monospace",
              family: "monospace",
            },
          ].concat(fontList),
          displayNameInput.style.fontFamily
        );
        if (!selectedFont) {
          return;
        }
        displayNameInput.style.fontFamily = selectedFont;
        usernameSpan.style.fontFamily = selectedFont;
        await fetch(accountHelper.getServerURL() + "/account/setfont/", {
          method: "POST",
          body: JSON.stringify({
            font: selectedFont,
          }),
        });
      };

      var signOutButton = elements.getGPId("signOutButton");

      signOutButton.onclick = async function () {
        var loadingScreen = loader.doLoadingScreen();
        await accountHelper.logoutOfAccount();
        window.location.href = "/";
        loadingScreen.remove();
      };

      var uploadPFP = elements.getGPId("uploadPFP");
      uploadPFP.onclick = function () {
        var input = document.createElement("input");
        input.accept = ".png, .jpeg, .bmp, .jpg, .ico, .webm, .webp";
        input.type = "file";
        input.onchange = function () {
          var file = input.files[0];
          if (file) {
            var reader = new FileReader();
            reader.onload = async function () {
              try {
                try {
                  var newImage = await compressImage(reader.result);
                } catch (e) {
                  dialog.alert(
                    "Image resizing and compression hit an error. Try another image?\nTechnical error: " +
                      e
                  );
                  return;
                }

                await fetch(
                  accountHelper.getServerURL() + "/account/picture/",
                  { method: "POST", body: newImage.split(",").pop() }
                );
                loadImage(newImage);
                dialog.alert(
                  "Profile picture upload success!\nReload all chatrooms to apply the new profile picture."
                );
              } catch (e) {
                dialog.alert(
                  `Couldn't upload your profile picture\nTry doing it again when you're ready.\nTechnical error: ${e}`
                );
              }
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      };
      var resetPFP = elements.getGPId("resetPFP");
      resetPFP.onclick = async function () {
        resetPFP.disabled = true;

        var accepted = await dialog.confirm(
          "Are you sure to reset your picture? Once its gone, its gone forever!"
        );

        if (!accepted) {
          return;
        }

        try {
          await fetch(accountHelper.getServerURL() + "/account/picture/", {
            method: "POST",
            body: "",
          });
          loadImage();
        } catch (e) {
          dialog.alert("Error deleting profile picture.");
        }

        resetPFP.disabled = false;
      };
      async function setColor(color) {
        userColor = color;
        displayNameInput.style.color = color;
        usernameSpan.style.color = color;
        await fetch(accountHelper.getServerURL() + "/account/setcolor/", {
          method: "POST",
          body: JSON.stringify({
            color,
          }),
        });
      }
      selectUsernameColorButton.addEventListener("click", async function () {
        var chosenColor = await colorSelect.ask(userColor);
        if (chosenColor) {
          await setColor(chosenColor);
        }
      });

      changeDisplayNameButton.onclick = async function () {
        displayNameInput.focus();
      };

      displayNameInput.style.cursor = "pointer";
      displayNameInput.onfocus = async function () {
        displayNameInput.style.cursor = "auto";
      };
      displayNameInput.onblur = async function () {
        displayNameInput.style.cursor = "pointer";
      };

      displayNameInput.onchange = async function () {
        displayNameInput.disabled = true;
        var displayName = displayNameInput.value;
        var response = await fetch(
          accountHelper.getServerURL() + "/account/displayname/",
          {
            method: "POST",
            body: JSON.stringify({
              displayName,
            }),
          }
        );
        if (!response.ok) {
          dialog.alert(
            "This name is too goofy or long, make it something shorter."
          );
          displayNameInput.disabled = false;
          return;
        }
        displayNameInput.value = displayName;
        displayNameInput.disabled = false;
      };

      var confirmPasswordMessage =
        "Change your password? Its no way back if you forget it!";

      changePasswordButton.onclick = async function () {
        changePasswordButton.disabled = true;
        if (await dialog.confirm(confirmPasswordMessage)) {
          var oldPassword = await dialog.passwordPrompt(
            "Type your old password, just to confirm its you."
          );
          if (!oldPassword) {
            dialog.alert("Password change canceled, nothing has been changed.");
            return;
          }
          var newPassword = await dialog.passwordPrompt(
            "Make a new password, make sure its unique to other sites you use."
          );
          if (!newPassword) {
            dialog.alert("Password change canceled, nothing has been changed.");
            return;
          }
          var loadingScreen = loader.doLoadingScreen();
          var response = await fetch(
            accountHelper.getServerURL() + "/account/passwordchange/",
            {
              method: "POST",
              body: JSON.stringify({
                newPassword,
                oldPassword,
              }),
            }
          );
          loadingScreen.remove();
          if (!response.ok) {
            dialog.alert(
              "Something went wrong while changing your password. Maybe try again?"
            );
            return;
          }
          dialog.alert(
            "Password was changed! All other devices have been signed out until you change the password back again."
          );
        }
        changePasswordButton.disabled = false;
      };

      var destroyAccountButton = elements.getGPId("destroyAccountButton");
      destroyAccountButton.onclick = async function () {
        destroyAccountButton.setAttribute("disabled", "");

        try {
          var destroyConfirm = await dialog.confirm(
            "Deactivating your account will:\n" +
              "- Make your account no longer accessible.\n" +
              "- You or someone else can't sign up with the same username.\n" +
              "- Rooms you own won't be deleted, they can still be accessed.\n" +
              "- Your profile picture and some info would be deleted to save database space.\n" +
              "- People that try to refrence your username would get an error.\n" +
              "Deactivate your account now? You can't undo this action!"
          );
          if (!destroyConfirm) {
            dialog.alert("Deactivation canceled.");
            destroyAccountButton.removeAttribute("disabled");
            return;
          }
          var destroyPassword = await dialog.passwordPrompt(
            "To make sure its actually you, enter your password:"
          );
          if (!destroyPassword) {
            dialog.alert("Deactivation canceled.");
            return;
          }
          var destroyResponse = await fetch(
            accountHelper.getServerURL() + "/account/destroy/",
            {
              method: "POST",
              body: JSON.stringify({
                password: destroyPassword,
              }),
            }
          );
          if (!destroyResponse.ok) {
            dialog.alert(
              "Deactivation had an error. Error: " +
                (await destroyResponse.json()).message
            );
            return;
          }
          dialog.alert("Your account was successfully deactivated!");
          window.location.href = "/";
        } catch (e) {
          console.error(e);
          dialog.alert("Error when trying to destroy account: " + e);
        }

        destroyAccountButton.removeAttribute("disabled");
      };
    } else {
      var elementJSON = [
        {
          element: "div",
          className: "centeredDialog",
          style: {
            backgroundColor: "white",
            borderRadius: "5px",
            padding: "15px 15px",
            boxShadow: "0px 0px 20px black",
          },
          children: [
            require("./sitenews-notice.js"),
            {
              element: "span",
              className: "headerText",
              textContent: "Oops!",
            },
            {
              element: "br",
            },
            {
              element: "span",
              textContent:
                "It doesn't seem like you're signed in, this might have been because your user information changed on another device or browser. You can sign in again to make this error go away.",
            },
            {
              element: "br",
            },
            {
              element: "div",
              style: {
                display: "flex",
              },
              children: [
                {
                  element: "div",
                  className: "button2",
                  eventListeners: [
                    {
                      event: "click",
                      func: function () {
                        window.location.href =
                          "/signin?href=" +
                          encodeURIComponent(
                            window.location.pathname + window.location.hash
                          );
                      },
                    },
                  ],
                  textContent: "Sign in",
                },
                {
                  element: "div",
                  style: {
                    width: "3px",
                  },
                },
                {
                  element: "div",
                  className: "button2",
                  eventListeners: [
                    {
                      event: "click",
                      func: function () {
                        window.location.href =
                          "/signup?href=" +
                          encodeURIComponent(
                            window.location.pathname + window.location.hash
                          );
                      },
                    },
                  ],
                  textContent: "Sign up",
                },
              ],
            },
          ],
        },
      ];

      var pageElements = elements.createElementsFromJSON(elementJSON);
      elements.appendElements(elements.body, pageElements);
    }
  } catch (e) {
    dialog.alert(e);
  }
})();
