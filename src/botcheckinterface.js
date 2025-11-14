var elements = require("./gp2/elements.js");
var accountHelper = require("./accounthelper/index.js");
var cssText = require("./botcheckinterface.css");
class BotCheckDiv {
  constructor() {
    var _this = this;
    this.created = false;
    this.jsonElement = {
      element: "div",
      children: [
        {
          element: "div",
          GPWhenCreated: function (elm) {
            _this.created = true;
            _this.divElm = elm;
            _this.onCreated();
          },
        },
        {
          element: "style",
          textContent: cssText,
        },
      ],
    };
  }

  _botVerificationPassedScreen() {
    var divElm = this.divElm;
    var _this = this;

    elements.setInnerJSON(divElm, [
      {
        element: "div",
        style: {
          textAlign: "center",
        },
        textContent: "Robot check passed!",
      },
      {
        element: "div",
        style: {
          textAlign: "center",
        },
        textContent: "Having issues? Click here to retry.",
      },
    ]);
    divElm.className = "botCheckDiv botCheckDivClickable botCheckDivPassed";
    divElm.onclick = async function () {
      divElm.onclick = function () {};
      divElm.className = "botCheckDiv";

      await _this._loadID();
    };
  }

  _botVerificationFailedScreen() {
    var divElm = this.divElm;
    var _this = this;

    elements.setInnerJSON(divElm, [
      {
        element: "div",
        style: {
          textAlign: "center",
        },
        textContent: "Robot check failed, click to try again.",
      },
    ]);
    divElm.className = "botCheckDiv botCheckDivClickable botCheckDivFailed";
    divElm.onclick = async function () {
      divElm.onclick = function () {};
      divElm.className = "botCheckDiv";

      await _this._loadID();
    };
  }

  _botVerificationScreen() {
    var divElm = this.divElm;
    var _this = this;
    var checkID = this.checkID;

    var codeInput = null;
    var buttonElement = null;

    elements.setInnerJSON(divElm, [
      {
        element: "img",
        src: accountHelper.getServerURL() + "/botcheck/image/" + checkID,
        style: {
          pointerEvents: "none",
          userSelect: "none",
        },
      },
      {
        element: "br",
      },
      {
        element: "span",
        style: {
          fontWeight: "bold",
        },
        textContent:
          'Type the large text exactly you see, then click "I\'m not an robot".',
      },
      {
        element: "br",
      },
      {
        element: "span",
        style: {
          fontWeight: "bold",
          fontSize: "14px",
          color: "red",
        },
        textContent: "Answer quickly! This may fail if you take too long!",
      },
      {
        element: "br",
      },
      {
        element: "input",
        type: "text",
        className: "botCheckInputText",
        placeholder: "Type here",
        eventListeners: [
          {
            event: "input",
            func: function () {
              this.value = this.value.toUpperCase();
            },
          },
          {
            event: "keydown",
            func: function (event) {
              if (event.key.toLowerCase() == "enter") {
                buttonElement.click();
              }
            },
          },
        ],
        GPWhenCreated: function (elm) {
          codeInput = elm;
          elm.focus();
        },
      },
      {
        element: "button",
        className: "botCheckButton",
        textContent: "I'm not an robot",
        GPWhenCreated: function (elm) {
          buttonElement = elm;
        },
        eventListeners: [
          {
            event: "click",
            func: async function () {
              elements.setInnerJSON(divElm, [
                {
                  element: "div",
                  style: {
                    textAlign: "center",
                  },
                  textContent: "Checking...",
                },
              ]);
              function whenError() {
                elements.setInnerJSON(divElm, [
                  {
                    element: "div",
                    style: {
                      textAlign: "center",
                      color: "red",
                    },
                    textContent: "Error trying to verify, click to try again.",
                  },
                ]);
                divElm.className = "botCheckDiv botCheckDivClickable";
                divElm.onclick = async function () {
                  divElm.onclick = function () {};
                  divElm.className = "botCheckDiv";

                  await _this._loadID();
                };
              }
              try {
                var response = await fetch(
                  accountHelper.getServerURL() +
                    "/botcheck/check/" +
                    _this.checkID,
                  {
                    method: "POST",
                    body: JSON.stringify({
                      code: codeInput.value.toUpperCase(),
                    }),
                  }
                );
                if (response.ok) {
                  var json = await response.json();
                  if (json.passed) {
                    _this._botVerificationPassedScreen();
                  } else {
                    _this._botVerificationFailedScreen();
                  }
                } else {
                  whenError();
                }
              } catch (e) {
                console.error(e);
                whenError();
              }
            },
          },
        ],
      },
    ]);
  }

  async _loadID() {
    var divElm = this.divElm;
    elements.setInnerJSON(divElm, [
      {
        element: "div",
        style: {
          textAlign: "center",
        },
        textContent: "Loading...",
      },
    ]);
    function whenError() {
      elements.setInnerJSON(divElm, [
        {
          element: "div",
          style: {
            textAlign: "center",
            color: "red",
          },
          textContent: "Error trying to verify, click to try again.",
        },
      ]);
      divElm.className = "botCheckDiv botCheckDivClickable";
      divElm.onclick = async function () {
        divElm.onclick = function () {};
        divElm.className = "botCheckDiv";

        await _this._loadID();
      };
    }
    try {
      var response = await fetch(
        accountHelper.getServerURL() + "/botcheck/create",
        { method: "POST" }
      );
      if (response.ok) {
        var json = await response.json();
        this.checkID = json.id;
        this._botVerificationScreen();
      } else {
        whenError();
      }
    } catch (e) {
      console.error(e);
      whenError();
    }
  }

  reset() {
    var divElm = this.divElm;
    var _this = this;

    divElm.onclick = async function () {
      divElm.onclick = function () {};
      divElm.className = "botCheckDiv";

      await _this._loadID();
    };
    elements.setInnerJSON(divElm, [
      {
        element: "div",
        style: {
          textAlign: "center",
        },
        textContent: "Click to show you are not a robot.",
      },
    ]);
    divElm.className = "botCheckDiv botCheckDivClickable";
    this.checkID = undefined;
  }

  onCreated() {
    this.reset();
  }

  click() {
    if (this.created) {
      this.divElm.click();
    }
  }

  getCheckID() {
    return this.checkID;
  }
}

module.exports = BotCheckDiv;
