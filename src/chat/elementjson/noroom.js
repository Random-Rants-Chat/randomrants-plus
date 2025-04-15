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
      textContent: "Welcome to Random Rants +"
    },
    {element:"br"},
    {
      element:"span",
      textContent: "Click the \"Manage rooms\" button on the menu bar to manage your rooms."
    },
    {element:"br"},
    {
      element:"span",
      textContent: "From there, you can create and join other rooms."
    },
  ]
};