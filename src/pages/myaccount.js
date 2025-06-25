require("../cookiewarning");
require("./stylesheet.js");
var menuBar = require("../menu.js"); //Menu bar.
var elements = require("../gp2/elements.js"); //Based on gvbvdxx-pack-2's element module.
var accountHelper = require("../accounthelper/index.js");
var dialog = require("../dialogs.js");

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

        // Get compressed image data URL as WebP with 70% quality
        const dataURL = cvs.toDataURL('image/webp', 0.7);

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
      reject("Unable to load image format, browser may not support this file format. (Stop trying to break the system, its not helpful.)");
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
          children: [
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
                    height: "64px"
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
                  title:
                    "Click this to change your usernames color, appears in chat as well!",
                  children: [
                    {
                      element: "input",
                      type: "color",
                      value: userColor,
                      gid: "username_color_input",
                    },
                  ],
                },
              ],
            },
            {
              element: "hr",
            },
            {
              element: "span",
              className: "headerText",
              textContent: "Your Random Rants + account",
            },
            { element: "br" },
            {
              element: "div",
              className: "button",
              gid: "changeDisplayNameButton",
              children: [
                {
                  element: "img",
                  src: "images/text.svg",
                  style: {
                    height: "17px"
                  }
                },
                {
                  element: "span",
                  textContent: "Change display name",
                }
              ]
            },
            {
              element: "div",
              className: "button",
              gid: "uploadPFP",
              children: [
                {
                  element: "img",
                  src: "images/profile.svg",
                  style: {
                    height: "17px"
                  }
                },
                {
                  element: "span",
                  textContent: "Upload profile picture",
                }
              ]
            },
            {
              element: "div",
              className: "button",
              eventListeners: [
                {
                  event: "click",
                  func: function () {
                    var usernameColorInput = elements.getGPId(
                      "username_color_input"
                    );
                    usernameColorInput.click();
                  },
                },
              ],
              children: [
                {
                  element: "img",
                  src: "images/brush.svg",
                  style: {
                    height: "17px"
                  }
                },
                {
                  element: "span",
                  textContent: "Change username color",
                }
              ]
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
                    height: "17px"
                  }
                },
                {
                  element: "span",
                  textContent: "Sign out",
                }
              ]
            },
          ],
        },
      ];

      var pageElements = elements.createElementsFromJSON(elementJSON);
      elements.appendElements(elements.body, pageElements);

      var queryNumber = 0;
      var pfp = elements.getGPId("profilePicture_account");
      var usernameColorInput = elements.getGPId("username_color_input");
      var usernameSpan = elements.getGPId("usernameSpan");
      var changeDisplayNameButton = elements.getGPId("changeDisplayNameButton");
      var displayNameInput = elements.getGPId("displayNameInput");
      

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

      var signOutButton = elements.getGPId("signOutButton");

      signOutButton.onclick = function () {
        accountHelper.logoutOfAccount();
        window.location.href = "/";
      };

      var uploadPFP = elements.getGPId("uploadPFP");
      uploadPFP.onclick = function () {
        var input = document.createElement("input");
        input.accept = ".png, .jpeg, .bmp, .jpg, .ico, .webm";
        input.type = "file";
        input.onchange = function () {
          var file = input.files[0];
          if (file) {
            var reader = new FileReader();
            reader.onload = async function () {
              try {
                
                try{
                  var newImage = await compressImage(reader.result);
                }catch(e){
                  dialog.alert("Error compressing image: "+e);
                  return;
                }
                
                await fetch(
                  accountHelper.getServerURL() + "/account/picture/",
                  { method: "POST", body: newImage.split(",").pop() }
                );
                loadImage(newImage);
              } catch (e) {
                dialog.alert(
                  `Error uploading profile picture, your profile is not uploaded. ${e}`
                );
              }
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      };

      usernameColorInput.onchange = async function () {
        userColor = usernameColorInput.value;
        displayNameInput.style.color = userColor;
        usernameSpan.style.color = userColor;
        await fetch(accountHelper.getServerURL() + "/account/setcolor/", {
          method: "POST",
          body: JSON.stringify({
            color: usernameColorInput.value,
          }),
        });
      };

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
          dialog.alert("Unable to set the display name.");
          return;
        }
        displayNameInput.value = displayName;
        displayNameInput.disabled = false;
      };
    } else {
      var elementJSON = [
        {
          element: "div",
          className: "centeredDialog",
          children: [
            {
              element: "span",
              className: "headerText",
              textContent: "Error with your account",
            },
            {
              element: "span",
              textContent:
                "You are not logged in, or you where logged out of your account. If you get this error, someone might have changed your user information. This can also happen if you change your user info on another device.",
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
