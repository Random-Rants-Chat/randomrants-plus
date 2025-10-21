var enabled = false;

if (enabled) {
  module.exports = {
    element: "div",
    className: "noticeDiv",
    eventListeners: [
      {
        event: "click",
        func: function () {
          window.location.href = "/sitenews";
        },
      },
    ],
    title:
      "Click to read Important News",
    children: [
      {
        element: "span",
        textContent: "Important News - Click to read",
      },
    ],
  };
} else {
  module.exports = { element: "div" };
}
