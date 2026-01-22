var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");
var accountHelper = require("../../accounthelper/index.js");
var fetchUtils = require("./fetchutils.js");

var elements = require("../../gp2/elements.js");
var accountHelper = require("../../accounthelper");
var shtml = require("../../safehtmlencode.js");
var cacheBust = require("./cachebust.js");
var sws = require("./sharedwebsocket.js");

var LoadingScreen = require("./mini-loader.js");

function makeUserListDiv(
  username,
  removeFunction,
  selectFunction,
  addFunction,
) {
  var pfp = accountHelper.getProfilePictureURL(username);
  var ownerNoteThing = {
    element: "div",
  };

  var icons = [];
  if (removeFunction) {
    icons.push({
      element: "div",
      style: {
        height: "23px",
        marginLeft: "0px",
      },
      className: "divButton roundborder",
      title: "Click to remove this user.",
      children: [
        {
          element: "span",
          textContent: "Remove",
        },
      ],
      eventListeners: [
        {
          event: "click",
          func: function () {
            removeFunction();
          },
        },
      ],
    });
  }

  if (selectFunction) {
    icons.push({
      element: "div",
      style: {
        height: "23px",
        marginLeft: "4px",
      },
      className: "divButton roundborder",
      title: "Click to remove this user.",
      children: [
        {
          element: "span",
          textContent: "Choose",
        },
      ],
      eventListeners: [
        {
          event: "click",
          func: function () {
            selectFunction();
          },
        },
      ],
    });
  }

  if (addFunction) {
    var isAdded = false;
    const SELECT_IMAGE = "images/check.svg";
    const SELECT_TEXT = "Select";
    const DESELECT_IMAGE = "images/remove.svg";
    const DESELECT_TEXT = "Deselect";
    var selectElm = null;
    icons.push({
      element: "div",
      style: {
        height: "23px",
        marginLeft: "4px",
      },
      className: "divButton roundborder",
      title: "Click to add this user",
      GPWhenCreated: function (elm) {
        selectElm = elm;
      },
      children: [
        {
          element: "img",
          src: SELECT_IMAGE,
          height: 20,
        },
        {
          element: "span",
          textContent: SELECT_TEXT,
        },
      ],
      eventListeners: [
        {
          event: "click",
          func: function () {
            isAdded = !isAdded;
            if (isAdded) {
              elements.setInnerJSON(selectElm, [
                {
                  element: "img",
                  src: DESELECT_IMAGE,
                  height: 20,
                },
                {
                  element: "span",
                  textContent: DESELECT_TEXT,
                },
              ]);
            } else {
              elements.setInnerJSON(selectElm, [
                {
                  element: "img",
                  src: SELECT_IMAGE,
                  height: 20,
                },
                {
                  element: "span",
                  textContent: SELECT_TEXT,
                },
              ]);
            }
            addFunction(isAdded);
          },
        },
      ],
    });
  }

  var dom = [
    {
      element: "div",
      children: [
        {
          element: "div",
          className: "onlineUserContainer",
          style: {
            alignItems: "center",
          },
          children: [
            {
              element: "img",
              className: "profile profilePictureMessage",
              src: cacheBust(pfp),
            },
            {
              element: "div",
              style: {
                display: "flex",
                flexDirection: "column",
              },
              children: [
                {
                  element: "span",
                  className: "usernameSpan",
                  textContent: username,
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
                  style: {
                    marginLeft: "15px",
                    display: "flex",
                  },
                  children: icons,
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  return dom[0];
}

class UserListMenu {
  constructor() {
    this.menuElement = null;
    this.userListDiv = null;
    var _this = this;

    this.dialogElement = elements.appendElementsFromJSON(document.body, [
      {
        element: "div",
        hidden: true,
        children: [
          //Background
          {
            element: "div",
            className: "dialogBackground",
          },
          //Dialog box
          {
            element: "div",
            className: "whiteBox centerMiddle popupDialogAnimation",
            style: {
              overflowY: "auto",
              maxHeight: "calc(100vh - 100px)",
              maxWidth: "calc(100vw - 300px)",
              minWidth: "360px",
            },
            children: [
              {
                element: "span",
                style: {
                  fontSize: "30px",
                  fontWeight: "bold",
                },
                textContent: "Your user list",
              },

              {
                element: "div",
                className: "divButton roundborder",
                textContent: "Close",
                eventListeners: [
                  {
                    event: "click",
                    func: function () {
                      _this.dialogElement.hidden = true;
                    },
                  },
                ],
              },

              {
                element: "div",
                className: "tipsTextBox",
                children: [
                  {
                    element: "b",
                    textContent: "Tips:",
                  },
                  {
                    element: "p",
                    textContent:
                      "This is where your known users would go. Known users can easily be referenced to invite or do other actions when prompted for usernames. Add and manage your known user list here.",
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
                    className: "divButton roundborder",
                    children: [
                      {
                        element: "img",
                        src: "images/adduserlist.svg",
                        style: {
                          height: "24px",
                        },
                      },
                      "Add user",
                    ],
                    eventListeners: [
                      {
                        event: "click",
                        func: this.addUserButtonClick.bind(this),
                      },
                    ],
                  },
                  {
                    element: "div",
                    className: "divButton roundborder",
                    children: [
                      {
                        element: "img",
                        src: "images/reload.svg",
                        style: {
                          height: "24px",
                        },
                      },
                      "Reload known user list",
                    ],
                    eventListeners: [
                      {
                        event: "click",
                        func: this.showUserListMenu.bind(this),
                      },
                    ],
                  },
                ],
              },

              {
                element: "div",
                className: "usersContainerRoomSettings",
                style: {
                  maxHeight: "130px",
                  overflow: "auto",
                },
                GPWhenCreated: function (elm) {
                  _this.userListDiv = elm;
                },
              },
              {
                element: "div",
                className: "divButton roundborder",
                textContent: "Close",
                eventListeners: [
                  {
                    event: "click",
                    func: function () {
                      _this.dialogElement.hidden = true;
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ])[0];
  }
  getMenuItem() {
    var _this = this;
    return {
      element: "div",
      className: "menuBarItem",
      style: {
        padding: "0px 0px",
        width: "40px",
      },
      children: [
        {
          element: "img",
          className: "notificationImage",
          src: "images/userlist.svg",
        },
      ],
      eventListeners: [
        {
          event: "click",
          func: function () {
            _this.showUserListMenu();
          },
        },
      ],
    };
  }

  showLoadingScreen() {
    var dialogBG = document.createElement("div");
    var loadingSpinnerDiv = document.createElement("div");
    var loadingSpinnerContainerDiv = document.createElement("div");
    var loadingSpinnerCDiv = document.createElement("div");
    loadingSpinnerContainerDiv.className = "loader2Container";
    dialogBG.className = "dialogBackground";
    loadingSpinnerDiv.className = "loader2";
    loadingSpinnerContainerDiv.append(loadingSpinnerDiv);
    loadingSpinnerCDiv.append(loadingSpinnerContainerDiv);
    loadingSpinnerCDiv.className = "centerMiddle";
    dialogBG.append(loadingSpinnerCDiv);
    document.body.append(dialogBG);
    return dialogBG;
  }

  async showUserListMenu() {
    await this.loadUserListMenu();
    this.dialogElement.hidden = false;
  }
  async loadUserListMenu() {
    var dialogBG = new LoadingScreen("Loading your known user list...");
    await this.fetchUserList();
    dialogBG.remove();
  }

  async fetchUserList() {
    try {
      var json = await fetchUtils.fetchAsJSON(
        accountHelper.getServerURL() + "/account/myuserlist",
        { method: "GET" },
      );
      this.currentUserList = json.users;
      this.loadUserList();
    } catch (e) {
      console.warn("Known user list fetch error: " + e);
      elements.setInnerJSON(this.userListDiv, [
        {
          element: "span",
          textContent:
            "Something went wrong while trying to grab your known user list from the internet, check your connection and try again later.",
        },
      ]);
    }
  }

  async removeFromUserList(username) {
    var dialogBG = new LoadingScreen(
      'Removing "' + username + '" from your known user list...',
    );
    try {
      var r = await fetch(
        accountHelper.getServerURL() + "/account/removeuserlist",
        {
          method: "POST",
          body: JSON.stringify({
            username,
          }),
        },
      );
      if (!r.ok) {
        throw new Error("");
      }

      this.loadUserListMenu();
    } catch (e) {
      dialogs.alert(
        "Failed to remove user from your known user list, try again later.",
      );
      console.error(e);
    }
    dialogBG.remove();
  }

  async addUsername(username) {
    var dialogBG = new LoadingScreen(
      'Adding "' + username + '" to your known user list...',
    );
    try {
      var r = await fetch(
        accountHelper.getServerURL() + "/account/adduserlist",
        { method: "POST", body: JSON.stringify({ username }) },
      );
      if (!r.ok) {
        throw new Error("");
      }
      this.loadUserListMenu();
    } catch (e) {
      dialogs.alert(
        "Failed to add user to your known user list, try again later.",
      );
    }
    dialogBG.remove();
  }

  async addUserButtonClick() {
    var response = await dialogs.prompt(
      "Add someone! Type their username below:",
    );
    if (response) {
      await this.addUsername(response.trim());
    }
  }

  loadUserList() {
    var listDiv = this.userListDiv;
    var _this = this;

    elements.setInnerJSON(
      listDiv,
      this.currentUserList.map((username) => {
        return makeUserListDiv(username, async function () {
          _this.removeFromUserList(username);
        });
      }),
    );
    if (listDiv.children.length < 1) {
      elements.setInnerJSON(listDiv, [
        {
          element: "span",
          textContent:
            "You have no known users - join rooms and add people to this list to remember them!",
        },
      ]);
    }

    try {
      sws.send(
        JSON.stringify({
          type: "onlineList",
        }),
      );
    } catch (e) {}
  }

  isUserAdded(username) {
    var formattedUsername = username.trim().toLowerCase();
    var state = accountHelper.getCurrentValidationState();
    if (state) {
      if (formattedUsername == state.username.trim().toLowerCase()) {
        return true;
      }
    }
    if (this.currentUserList) {
      return this.currentUserList.indexOf(formattedUsername) > -1;
    }
    return false;
  }

  getUserPrompt(infoText = "Choose an user") {
    var _this = this;
    return new Promise(async (accept, reject) => {
      var usernameInput = null;
      await _this.loadUserListMenu();
      var dialogElement = elements.appendElementsFromJSON(document.body, [
        {
          element: "div",
          children: [
            //Background
            {
              element: "div",
              className: "dialogBackground",
            },
            //Dialog box
            {
              element: "div",
              className: "whiteBox centerMiddle popupDialogAnimation",
              style: {
                overflowY: "auto",
                maxHeight: "calc(100vh - 100px)",
                maxWidth: "calc(100vw - 300px)",
              },
              children: [
                {
                  element: "span",
                  style: {
                    fontSize: "30px",
                    fontWeight: "bold",
                  },
                  textContent: infoText,
                },

                {
                  element: "br",
                },

                {
                  element: "span",
                  textContent: "Username:",
                },
                {
                  element: "input",
                  type: "text",
                  GPWhenCreated: function (elm) {
                    usernameInput = elm;
                  },
                },
                {
                  element: "button",
                  className: "roundborder",
                  textContent: "OK",
                  eventListeners: [
                    {
                      event: "click",
                      func: function () {
                        dialogElement.remove();
                        var val = usernameInput.value.trim().toLowerCase();
                        accept(val.length > 0 ? val : undefined);
                      },
                    },
                  ],
                },
                {
                  element: "button",
                  className: "roundborder",
                  textContent: "Cancel",
                  eventListeners: [
                    {
                      event: "click",
                      func: function () {
                        dialogElement.remove();
                        accept();
                      },
                    },
                  ],
                },
                {
                  element: "br",
                },

                {
                  element: "br",
                },

                {
                  element: "span",
                  textContent: "From your known user list: ",
                },

                {
                  element: "div",
                  className: "usersContainerRoomSettings",
                  style: {
                    maxHeight: "130px",
                    overflow: "auto",
                  },
                  children: _this.currentUserList.map((username) => {
                    return makeUserListDiv(username, null, function () {
                      usernameInput.value = username;
                      usernameInput.scrollIntoView();
                    });
                  }),
                },
              ],
            },
          ],
        },
      ])[0];
    });
  }

  getUsersPrompt(infoText = "Choose users") {
    var _this = this;
    return new Promise(async (accept, reject) => {
      var usernameInput = null;
      await _this.loadUserListMenu();
      var selectedUsers = [];
      var dialogElement = elements.appendElementsFromJSON(document.body, [
        {
          element: "div",
          children: [
            //Background
            {
              element: "div",
              className: "dialogBackground",
            },
            //Dialog box
            {
              element: "div",
              className: "whiteBox centerMiddle popupDialogAnimation",
              style: {
                overflowY: "auto",
                maxHeight: "calc(100vh - 100px)",
                maxWidth: "calc(100vw - 300px)",
              },
              children: [
                {
                  element: "span",
                  style: {
                    fontSize: "30px",
                    fontWeight: "bold",
                  },
                  textContent: infoText,
                },

                {
                  element: "br",
                },
                {
                  element: "button",
                  className: "roundborder",
                  textContent: "OK",
                  eventListeners: [
                    {
                      event: "click",
                      func: function () {
                        dialogElement.remove();
                        accept(selectedUsers);
                      },
                    },
                  ],
                },
                {
                  element: "button",
                  className: "roundborder",
                  textContent: "Cancel",
                  eventListeners: [
                    {
                      event: "click",
                      func: function () {
                        dialogElement.remove();
                        accept([]);
                      },
                    },
                  ],
                },
                {
                  element: "br",
                },

                {
                  element: "br",
                },

                {
                  element: "span",
                  textContent: "From your known user list: ",
                },

                {
                  element: "div",
                  className: "usersContainerRoomSettings",
                  style: {
                    maxHeight: "130px",
                    overflow: "auto",
                  },
                  children: _this.currentUserList.map((username) => {
                    return makeUserListDiv(
                      username,
                      null,
                      null,
                      function (addOrRemove) {
                        if (addOrRemove) {
                          selectedUsers.push(username);
                        } else {
                          selectedUsers = selectedUsers.filter(
                            (otherUser) => otherUser !== username,
                          );
                        }
                      },
                    );
                  }),
                },
              ],
            },
          ],
        },
      ])[0];
    });
  }
}

module.exports = new UserListMenu();
