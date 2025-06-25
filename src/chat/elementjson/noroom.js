var headerSpanStyle = {
  fontWeight:"bold",
  fontSize:"20px"
};

module.exports = {
  element: "div",
  gid: "noCurrentRoom",
  class: "whiteBox centerMiddle",
  hidden: true,
  children: [
    {
      element:"span",
      textContent: "Random Rants +",
      style: headerSpanStyle
    },
    {element:"br"},
    {
      element:"span",
      textContent: "Welcome to the chaos zone! (a.k.a. Random Rants +)"
    },
    {element:"br"},
    {
      element:"span",
      textContent: "To get started, hit the \"Manage rooms\" button in the menu bar above."
    },
    {element:"br"},
    {
      element:"span",
      textContent: "From there, you can create a new room or hop into an existing one."
    },
    {element:"br"},
    {
      element:"span",
      textContent: "Let the randomness begin. 🎉"
    },
  ]
};