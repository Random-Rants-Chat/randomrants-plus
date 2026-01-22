var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");

class ClientSettingsMenu {
  constructor() {
    this.client_settings_name = "randomRantsPlusClientSettings";
    this.defaultSettings = {
      CHAT_NOTIFY: true,
      UI_SOUNDS: true,
      JOKE_COMMANDS: true,
      BRACKET_CODE_SOUNDS: true,
      BELL_NOTIFICATIONS: true,
		DARK_THEME: false,
    };
    this.settings = {};
	  this.settingFuncs = {};
    this.settingsList = [
      {
        name: "Chat notifcations",
        id: "CHAT_NOTIFY",
        type: "on-off",
      },
      {
        name: "Bell Icon Notifications",
        id: "BELL_NOTIFICATIONS",
        type: "on-off",
      },
      {
        name: "Interface sounds",
        id: "UI_SOUNDS",
        type: "on-off",
      },
      {
        name: "Show goofy admin commands",
        id: "JOKE_COMMANDS",
        type: "on-off",
      },
      {
        name: "Message bracket sounds",
        id: "BRACKET_CODE_SOUNDS",
        type: "on-off",
      },
		{
        name: "Dark theme (Experimental): ",
        id: "DARK_THEME",
        type: "on-off",
      },
    ];
    this.init();
  }

	addSettingChangeFunction(id, func) {
		this.settingFuncs[id] = func;
	}

	removeSettingChangeFunction(id) {
		delete this.settingFuncs[id];
	}

  getSetting(id) {
    return this.settings[id];
  }
  setSetting(id, value) {
    this.settings[id] = value;
	  if (this.settingFuncs[id]) {
		  this.settingFuncs[id](value);
	  }
  }

  addClientSettingSwitchButton(id) {
    var value = this.getSetting(id);
    var _this = this;
    return {
      element: "div",
      className: "clientSettingsSwitchButton",
      GPWhenCreated: function (elm) {
        if (value) {
          elm.setAttribute("ison", "");
          elm.textContent = "ON";
        } else {
          elm.removeAttribute("ison");
          elm.textContent = "OFF";
        }

        elm.addEventListener("click", function () {
          var value = _this.getSetting(id);
          value = !value;
          _this.setSetting(id, value);
          _this.saveSettings();
          if (value) {
            elm.setAttribute("ison", "");
            elm.textContent = "ON";
          } else {
            elm.removeAttribute("ison");
            elm.textContent = "OFF";
          }
        });
      },
    };
  }

  init() {
    var _this = this;
    this.loadSettings();
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
              minHeight: "360px",
            },
            children: [
              {
                element: "span",
                style: {
                  fontSize: "30px",
                  fontWeight: "bold",
                },
                textContent: "Client settings",
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
                style: {
                  margin: "8px 0",
                  padding: "8px",
                  backgroundColor: "#fffae6",
                  border: "1px solid #f0e68c",
                  borderRadius: "6px",
                  fontSize: "14px",
                  color: "#665500",
                  width: "fit-content",
                  height: "fit-content",
                },
                children: [
                  {
                    element: "p",
                    textContent: "Tips:",
                  },
                  {
                    element: "p",
                    textContent:
                      "These settings won't be applied to everyone else, and these are only stored for this device.",
                  },
                  {
                    element: "p",
                    textContent:
                      "For notifcations to work, make sure your current notifcations are cleared on your device and not blocked, and make sure the site is allowed to send notifications",
                  },
                ],
              },

              {
                element: "br",
              },

              {
                element: "div",
                className: "sep1",
              },

              {
                element: "br",
              },

              {
                element: "div",
                children: this.settingsList.map((settingInfo) => {
                  if (settingInfo.type == "on-off") {
                    return {
                      element: "div",
                      style: {
                        padding: "4px 0px",
                        display: "flex",
                      },
                      children: [
                        {
                          element: "div",
                          textContent: settingInfo.name + ": ",
                        },
                        this.addClientSettingSwitchButton(settingInfo.id),
                      ],
                    };
                  }
                  return {
                    element: "div",
                  };
                }),
              },

              {
                element: "br",
              },

              {
                element: "div",
                className: "sep1",
              },

              {
                element: "br",
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

    this.closeMenu();
  }

  openMenu() {
    this.dialogElement.hidden = false;
  }
  closeMenu() {
    this.dialogElement.hidden = true;
  }

  loadSettings() {
    for (var settingName of Object.keys(this.defaultSettings)) {
      this.settings[settingName] = this.defaultSettings[settingName];
    }
    if (localStorage.getItem(this.client_settings_name)) {
      var settingJSON = JSON.parse(
        localStorage.getItem(this.client_settings_name),
      );
      for (var settingName of Object.keys(settingJSON)) {
        this.settings[settingName] = settingJSON[settingName];
      }
    }
  }
  saveSettings() {
    localStorage.setItem(
      this.client_settings_name,
      JSON.stringify(this.settings),
    );
  }
}

module.exports = new ClientSettingsMenu();
