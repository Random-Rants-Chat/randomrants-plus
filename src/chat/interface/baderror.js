function handleErrors(e) {
  //Handle errors and display them to the user,
  //also log inside the devloper tools console
  //to try to give further information about this error.
  document.body.style.color = "red";
  document.body.style.background = "black";
  document.body.style.fontFamily = "arial";
  document.body.innerHTML =
    "<h1>Whoops!</h1>" +
    e +
    "<hr>" +
    "The page encountered an unhandled error. This means that Random Rants + could not start successfully. Try reloading by clicking the refresh button on your browser, or click the button below to preform a refresh.<br>" +
    "Try clearing your browser cookies if this error continues.<br>If you're a developer, check the developer console for further details about this error message.<br>" +
    '<button onclick="window.location.reload()">Refresh</button>';
  console.error(e);
}

module.exports = handleErrors;