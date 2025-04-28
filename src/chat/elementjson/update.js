module.exports = {
  element: "div",
  style: {
    zIndex: 10,
  },
  gid: "rrUpdateScreen",
  hidden: true,
  children: [
    {
      element: "div",
      className: "dialogBackground",
    },
    {
      element: "div",
      className: "whiteBox centerMiddle popupDialogAnimation",
      children: [
        {
          element: "span",
          style: {
            fontSize: "30px",
            fontWeight: "bold",
          },
          textContent: "Random Rants + Needs to update.",
        },
        {
          element: "div",
          className: "sep1"
        },
        {
          element: "div",
          style: {
            display: "flex",
          },
          children: [
            {
              element: "img",
              src: "images/updatebox.svg",
              style: {
                height: "100%",
                padding: "10px 10px",
              },
            },
            {
              element: "div",
              style: {
                padding: "10px 10px",
              },
              children: [
                {
                  element: "span",
                  textContent: "You need to reload to install the update.",
                },
                {
                  element: "br",
                },
                {
                  element: "div",
                  className: "divButton roundborder",
                  textContent: "Reload and install now",
                  title: "Reload and install now",
                  eventListeners: [
                    {
                      event: "click",
                      func: function () {
                        this.textContent = "Now reloading...";
                        this.disabled = true;
                        window.location.reload();
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
