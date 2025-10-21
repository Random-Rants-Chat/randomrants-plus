module.exports = {
  element: "div",
  gid: "noAccountNoticeDialog",
  hidden: true,
  style: {
    zIndex: 10,
  },
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
            fontWeight: "bold",
            fontSize: "30px",
          },
          textContent: "Want to unlock more features?",
        },
        {
          element: "div",
          className: "sep1",
        },
        {
          element: "span",
          textContent:
            "Already here? Sign in to get all features. New Here? Sign up to join the rest of the ranters.",
        },
        {
          element: "br",
        },
        {
          element: "span",
          style: {
            fontSize: "13px",
          },
          textContent: "No email or phone number required! Its all free!",
        },
        {
          element: "br",
        },
        {
          element: "br",
        },
        {
          element: "span",
          textContent: "What do you get?",
        },

        {
          element: "ul",
          children: [
            {
              element: "li",
              textContent:
                "Auto-save rooms you join - Quickly hop into rooms that you have joined already.",
            },
            {
              element: "li",
              textContent:
                "Get private messages sent to you in rooms - People can click your display name in your messages to send messages you will only see",
            },
            {
              element: "li",
              textContent:
                "Customize your account - Customize and tell who exactly you are with username colors, display names, and profile pictures.",
            },
            {
              element: "li",
              textContent:
                "Room owners can give you ownership - Get owner powers from people that trust you in their rooms, do everything an owner can! (Except steal the true room owners powers)",
            },
            {
              element: "li",
              textContent:
                "Make your own rooms - Invite friends (or whoever) you want to talk to, and give out ownership to people that you trust.",
            },
          ],
        },

        {
          element: "div",
          className: "sep1",
        },

        {
          element: "div",
          className: "divButton roundborder",
          textContent: "Let me stay as guest",
          gid: "continueAsGuestButton",
        },
        {
          element: "div",
          style: {
            display: "flex",
          },
          children: [
            {
              element: "div",
              className: "divButton roundborder",
              textContent: "Sign in",
              eventListeners: [
                {
                  event: "click",
                  func: function () {
                    window.location.href =
                      "/signin?href=" +
                      encodeURIComponent(
                        window.location.pathname + window.location.hash,
                      );
                  },
                },
              ],
            },
            { element: "div", style: { width: "2px" } },
            {
              element: "div",
              className: "divButton roundborder",
              textContent: "Sign up",
              eventListeners: [
                {
                  event: "click",
                  func: function () {
                    window.location.href =
                      "/signup?href=" +
                      encodeURIComponent(
                        window.location.pathname + window.location.hash,
                      );
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
