function createSocialDivJSON(
  hueSatArray,
  imagesrc,
  name,
  subname,
  socialButtons,
  discriptionArray,
) {
  return {
    element: "div",
    className: "creatorDiv",
    styleProperties: {
      "--hue": hueSatArray[0],
      "--sat": hueSatArray[1],
    },
    children: [
      {
        element: "div",
        className: "creatorName",
        children: [
          {
            element: "img",
            src: imagesrc,
            style: {
              height: "65px",
              width: "65px",
              objectFit: "contain",
              marginRight: "10px",
              borderRadius: "5px",
            },
          },
          {
            element: "div",
            className: "creatorNameText",
            children: [
              {
                element: "span",
                textContent: name,
                style: {
                  fontWeight: "bold",
                  fontSize: "23px",
                  marginRight: "10px",
                },
              },
              {
                element: "span",
                textContent: subname,
                style: {
                  fontSize: "12px",
                },
              },
            ],
          },
          {
            element: "div",
            style: {
              marginRight: "auto",
            },
          },
        ].concat(
          socialButtons.map((button) => {
            return {
              element: button.href ? "a" : "div",
              className: "creatorSocialLink",
              children: [
                {
                  element: "img",
                  src: button.src,
                  style: {
                    height: "100%",
                  },
                },
              ],
              eventListeners: button.href
                ? []
                : [
                    {
                      event: "click",
                      func: button.func,
                    },
                  ],
              href: button.href ? button.href : "",
              target: "_blank",
            };
          }),
        ),
      },
      {
        element: "div",
        className: "creatorDiscription",
        children: discriptionArray.map((text) => {
          return {
            element: "span",
            textContent: text,
          };
        }),
      },
    ],
  };
}

module.exports = { createSocialDivJSON };
