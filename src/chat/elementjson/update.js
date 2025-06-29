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
          textContent: "Time for a lil’ Chaos Refresh",
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
                  textContent: "Hey! We just dropped a new batch of Random Rants+ chaos. To catch all the updates (and maybe a few new bugs), just give it a quick reload.",
                },
                {
                  element: "br",
                },
                {
                  element: "span",
                  textContent:
                    "If this keeps popping up, Glitch might still be syncing behind the scenes—or maybe we’re just getting a bit too creative.",
                },
                {
                  element: "br",
                },
                {
                  element: "div",
                  className: "divButton roundborder",
                  textContent: "Reload and vibe",
                  title: "Reload and vibe",
                  eventListeners: [
                    {
                      event: "click",
                      func: function () {
                        this.textContent = "Reloading…";
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
