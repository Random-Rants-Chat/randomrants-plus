var headerSpanStyle = {
  fontWeight: "bold",
  fontSize: "20px",
};

module.exports = {
  element: "div",
  gid: "noCurrentRoom",
  class: "whiteBox centerMiddle",
  hidden: true,
  children: [
    {
      element: "span",
      textContent: "Random Rants +",
      style: headerSpanStyle,
    },
    { element: "br" },
    {
      element: "span",
      textContent: "Welcome to Random Rants +",
    },
    { element: "br" },
    {
      element: "span",
      textContent:
        'To get started, press the button below, or hit "Manage rooms" on the menu bar above.',
    },
    { element: "br" },
    {
      element: "span",
      textContent:
        "From there, you could hop into rooms you've already joined, and recieve invites from there.",
    },
    { element: "br" },
    {
      element: "span",
      textContent: "Start ranting, random ranter!",
    },
    { element: "br" },
    {
      element: "div",
      className: "divButton roundborder",
      textContent: "Manage rooms",
      gid: "manageRoomsDivButton",
    },
  ],
};
