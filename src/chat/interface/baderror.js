function handleErrors(e) {
  document.body.style.color = "red";
  document.body.style.background = "black";
  document.body.style.fontFamily = "Comic Sans MS, sans-serif";
  //Glitch.me no longer is used because its shutting down and blahblahblah.
  document.body.innerHTML =
    "<h1>⚠️ Whoops! Random Rants+ crashed harder than missing that group project</h1>" +
    "<p>The site failed to load properly. Here's what might’ve gone wrong:</p>" +
    "<hr>" +
    "<ul>" +
    "<li>🔁 <strong>Reload the page.</strong> Sometimes it just needs a good smack (aka refresh).</li>" +
    "<li>🍪 <strong>Clear cookies and cache</strong> if you think you caught it mid-update. Stuff breaks fast when it’s live-edited.</li>" +
    "<li>📶 <strong>Slow or unstable internet?</strong> Some files may not have made it in. Try again on a stronger connection.</li>" +
    "<li>🚷 <strong>Getting a 403 Forbidden?</strong> Some free deploying services sometimes blocks specific IPs temporarily (yes, even on VPNs). Try again later or use a different connection.</li>" +
    "<li>📈 <strong>Too many users?</strong> Some free deploying service projects have request limits. If everyone's seeing errors, it's probably that.</li>" +
    "<li>🧑‍💻 <strong>Dev mode:</strong> Open the console for detailed error logs if you're debugging.</li>" +
    "<li>🤖 <strong>Bad AI code:</strong> Random Rants + devs sometimes use AI to generate code, but not all of the site is AI generated. Portions of code may fail because of this because of AI misunderstandings.</li>" +
    "<li><strong>Forgot to run that localhost server?:</strong> specifically for Random Rants + devs in the future: Now RR+ recommends you to use localhost for testing, but this may be more difficult to get used to, make sure you run the server and everything will be ok.</li>" +
    "</ul>" +
    "<br>" +
    "<button onclick='window.location.reload()'>🔄 Refresh This Mess</button>" +
    " <button onclick='window.open(\"https://github.com/random-rants-chat/randomrants-plus/issues\", \"_blank\")'>🐛 Report to GitHub Repo</button>" +
    "<p><i>Still broken? You’ve officially unlocked ‘Ultra Chaos Mode.’ Congrats?</i></p>" +
    "<hr>" +
    "<pre style='white-space: pre-wrap; word-break: break-word; background:#222; color:#fff; padding:10px; border-radius:10px; font-size: 14px;'>" +
    "Error details:\n" + e +
    "</pre>";

  console.error("🚨 Random Rants+ failed to load:\n", e);
}

module.exports = handleErrors;
