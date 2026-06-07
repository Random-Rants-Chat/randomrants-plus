var enabled = true;

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
    title: "Click to read Important News",
    children: [
      {
        element: "span",
        textContent: "I NEED your help! (And additional news)",
      },
    ],
  };
} else {
  module.exports = { element: "div" };
}
