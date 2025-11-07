var elements = require("../../gp2/elements.js");

var toastContainer = elements.createElementsFromJSON([
	{
		element: "div",
		style: {
			position: "fixed",
			bottom: "0px",
			left: "50%",
			display: "flex",
			flexDirection: "cloumn",
			padding: "5px 5px",
			transform: "translate(-50%, 0%)"
		}
	}
])[0];

class ToastNotification {
	constructor (message = "Toast message", hue = 0, sat = 0) {
		this.element = elements.createElementsFromJSON([
			{
				element: "div",
				style: {
					padding: "3px 3px",
					fontWeight: "bold",
					background: `hsla(${hue}deg, ${sat}%, 100%, 0.5)`,
					color: `hsla(${hue}deg, ${sat}%, 20%, 0.5)`,
					borderRadius: "5px",
					width: "fit-content",
					height: "fit-content"
				},
				textContent: message
			}
		])[0];
		
	}
}