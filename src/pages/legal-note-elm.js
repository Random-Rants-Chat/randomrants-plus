module.exports = {
    element: "div",
    style: {
      backgroundColor: "rgba(255, 183, 183, 1)", // Faint yellow background
      borderLeft: "4px solid #ff0000ff", // Solid yellow bar on the left
      padding: "10px",
      marginBottom: "20px",
      borderRadius: "4px",
      fontSize: "0.9em"
    },
    children: [
      {
        element: "span",
        textContent: "Important: Please read our ",
        children: []
      },
      {
        element: "a",
        href: "/legal",
        textContent: "Terms of Use & Privacy Policy",
        style: {
          fontWeight: "bold",
          textDecoration: "underline",
          cursor: "pointer"
        },
        children: []
      },
      {
        element: "span",
        textContent: " before using Random Rants +.",
        children: []
      }
    ]
  };