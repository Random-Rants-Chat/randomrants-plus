require("../cookiewarning");
var menuBar = require("../menu.js"); //Menu bar.
var elements = require("../gp2/elements.js"); //Based on gvbvdxx-pack-2's element module.
var accountHelper = require("../accounthelper/index.js");
var dialog = require("../dialogs.js");

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
                    height: "50px",
                    maxWidth: "50px",
                  },
                  gid: "profilePicture_account",
                },
                {
                  element: "div",
                  style: {
                    display: "flex",
                    flexDirection: "column"
                  },
                  children: [
                    {
                      element: "span",
                      style: {
                        alignContent: "center",
                        fontSize: "30px",
                        fontWeight: "bold",
                        color: userColor,
                      },
                      gid: "displayNameSpan",
                      textContent: session.displayName,
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
                    }
                  ]
                },
                {
                  element: "div",
                  style: {
                    width: "10px"
                  }
                },
                {
                  element: "div",
                  style: {
                    alignContent: "center"
                  },
                  title: "Click this to change your usernames color, appears in chat as well!",
                  children: [
                    {
                      element: "input",
                      type: "color",
                      value: userColor,
                      gid: "username_color_input"
                    }
                  ]
                }
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
            {element:"br"},
            {
                  element: "div",
                  className: "button",
                  gid: "changeDisplayNameButton",
                  textContent: "Change display name"
                },
            {
                  element: "div",
                  className: "button",
                  gid: "uploadPFP",
                  textContent: "Upload profile picture"
                },
            {
                  element: "div",
                  className: "button",
                  eventListeners: [
                    {
                      event: "click",
                      func: function () {
                        var usernameColorInput = elements.getGPId("username_color_input");
                        usernameColorInput.click();
                      }
                    }
                  ],
                  textContent: "Change username color"
                },
            {
                  element: "div",
                  className: "button",
                  gid: "signOutButton",
                  textContent: "Sign out"
                }
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
      var displayNameSpan = elements.getGPId("displayNameSpan");

      async function loadImage(imageFile) {
        var imgurl = accountHelper.getProfilePictureURL(session.username);
        try{
          for (var i = 0; i < 3; i++) {
            await fetch(imgurl, {cache: 'reload', mode: 'no-cors'});
          }
        }catch(e){}
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
                try{
                  await fetch(accountHelper.getServerURL()+"/account/picture/",{method:"POST",body:reader.result.split(",").pop()});
                  loadImage(reader.result);
                }catch(e){
                  dialog.alert(`Error uploading profile picture, your profile is not uploaded. ${e}`);
                }
              };
              reader.readAsDataURL(file);
            }
          };
          input.click();
        };
      
      usernameColorInput.onchange = async function () {
        userColor = usernameColorInput.value;
        changeDisplayNameButton.style.color = userColor;
        usernameSpan.style.color = userColor;
        await fetch(accountHelper.getServerURL()+"/account/setcolor/",{method:"POST",body:JSON.stringify({
          color: usernameColorInput.value
        })});
      };
      
      changeDisplayNameButton.onclick = async function () {
        var displayName = await dialog.prompt("Enter your new display name",displayNameSpan.textContent);
        if (!displayName) {
          return;
        }
        try{
        await fetch(accountHelper.getServerURL()+"/account/displayname/",{method:"POST",body:JSON.stringify({
          displayName
        })});
        displayNameSpan.textContent = displayName;
        }catch(e){
          dialog.alert("Unable to set the display name, your display name can't be more than 100 characters.");
          return;
        }
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