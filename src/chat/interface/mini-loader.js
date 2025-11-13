var elements = require("../../gp2/elements.js");

class LoadingScreen {
  constructor(text = "Loading...") {
    var _this = this;
    this.loadingElement = document.createElement("div");
    this.textSpan = null;
    var dom = elements.createElementsFromJSON([
      //Background
      {
        element: "div",
        className: "dialogBackground",
        style: {
          zIndex: "9999999999",
        },
      },
      //Dialog box
      {
        element: "div",
        className: "centerMiddle",
        style: {
          zIndex: "9999999999",
          padding: "5px 5px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        },
        children: [
          {
            element: "div",
            className: "loader2Container",
            children: [
              {
                element: "div",
                className: "loader2",
              },
            ],
          },
          {
            element: "span",
            textContent: "",
            style: {
              fontWeight: "bold",
              fontSize: "17px",
              textAlign: "center",
              padding: "7px 7px",
              background: "rgba(255, 255, 255, 50%)",
              color: "black",
              borderRadius: "5px",
            },
            GPWhenCreated: (elm) => (_this.textSpan = elm),
          },
        ],
      },
    ]);
    elements.appendElements(this.loadingElement, dom);
    document.body.append(this.loadingElement);

    this.setText(text);
  }

  setText(text) {
    this.textSpan.textContent = text;
  }

  dispose() {
    this.loadingElement.remove();
    this.loadingElement = null;
    this.textSpan.remove();
    this.textSpan = null;
  }
  remove() {
    this.dispose();
  }
}
module.exports = LoadingScreen;
