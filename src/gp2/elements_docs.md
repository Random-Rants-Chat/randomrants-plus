# 🛠 GP2 Elements Engine Documentation
**Location:** `./src/gp2/elements.js`

This is the custom rendering engine for Random Rants +. It allows us to build the UI using lightweight JS objects (JSON) instead of heavy frameworks like React.

---

## 🚀 Basic Usage
To create an element, pass an array of objects to elements.createElementsFromJSON().
```javascript
const elements = require('./gp2/elements.js');

const myUI = elements.createElementsFromJSON([
  {
    element: "div",
    className: "rant-container",
    style: {
      padding: "10px",
      backgroundColor: "#222"
    },
    children: [
      {
        element: "h1",
        textContent: "Hello Rant World!",
        style: { color: "cyan" }
      }
    ]
  }
]);

document.body.append(...myUI);
```

---

## 🔑 Special Properties

- element: The HTML tag name (e.g., "div", "button", "input").
- gid: Global ID. Stores the element in __GP_elements. Access it later via elements.getGPId("id").
- children: An array of more element objects to nest inside this one.
- style: An object of CSS properties (e.g., { color: "red" }).
- styleProperties: Uses style.setProperty. Good for CSS variables like --user-color.
- eventListeners: An array of objects: [{ event: "click", func: myFunc }].
- GPWhenCreated: A function that runs as soon as the element is made. "this" refers to the element.
- dangerouslySetInnerHTML: Used to inject raw HTML. (Replaces the deprecated innerHTML).

---

## 🛠 Advanced Example: Interactive Component
Use GPWhenCreated and eventListeners to make things interactive.

```javascript
const chatInput = elements.createElementsFromJSON([
  {
    element: "input",
    gid: "main-input", 
    placeholder: "Type a rant...",
    eventListeners: [
      {
        event: "keydown",
        func: (e) => { if(e.key === "Enter") console.log("Sent!"); }
      }
    ],
    GPWhenCreated: function(elm) {
      console.log("Input is ready!");
      elm.focus();
    }
  }
]);
```

---

## ⚠️ Guidelines for Contributors
1. No React: Use this engine. It's lighter for school Chromebooks.
2. Render Free Tier: Keep the code light. Don't cause memory leaks.
3. Cleaning Up: If you use a gid, use elements.disposeGPId("id") if the element is removed.
