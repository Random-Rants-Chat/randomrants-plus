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
          textContent: "Incoming Updates!",
        },
        {
          element: "div",
          className: "sep1",
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
                  textContent:
                    "Some new crazy Random Rants + updates have been dropped! To get those you must press the reload button below.",
                },
                {
                  element: "br",
                },
                {
                  element: "span",
                  textContent:
                    "If this keeps appearing, then things must be syncing or we're having too much fun tweaking things!",
                },
                {
                  element: "br",
                },
                {
                  element: "div",
                  style: {
                    fontWeight: "bold",
                  },
                  children: [
                    {
                      element: "span",
                      textContent: "This update was dropped ",
                    },
                    {
                      element: "span",
                      gid: "updateVersionTime", //Inserts text like "1 minute".
                    },
                    {
                      element: "span",
                      textContent: " ago.",
                    },
                  ],
                },
                {
                  element: "br",
                },
                {
                  element: "div",
                  className: "divButton roundborder",
                  textContent: "Reload now",
                  eventListeners: [
                    {
                      event: "click",
                      func: function () {
                        this.textContent = "Reloading...";
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
