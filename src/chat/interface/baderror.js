//Not all errors would be displayed with this.
//Usually loading errors display this.

function handleErrors(e) {
  document.body.style.color = "red";
  document.body.style.background = "black";
  document.body.style.fontFamily = "Comic Sans MS, sans-serif";

  document.body.innerHTML =
    "<h1>Random Rants + Errored itself into an oblivion!</h1>" +
    "<p>The site failed to load, these are some reasons that it could be happening:</p>" +
    "<hr>" +
    "<ul>" +
    "<li>🔁 <strong>Click that refresh button</strong> Tech support is always like 'Have you tried to turn it off and on again'. Maybe it works here too.</li>" +
    "<li>🍪 <strong>Cookies & cache:</strong> Maybe something expired or your browser is caching stuff that needs a good reset. Try clearing your cookies and cache.</li>" +
    "<li>📶 <strong>Your WiFi signal</strong> If your internet connection is very slow, it could be that.</li>" +
    "<li>🚷 <strong>403 Forbidden?</strong> Free hosting somethimes gets you, if you send requests too fast, maybe its that.</li>" +
    "<li>📈 <strong>Popularity has it's side effects:</strong> Popularity means tons of requests, so maybe our free-teir servers gave up.</li>" +
    "<li>🧑‍💻 <strong>Developer mode:</strong> Open the developer tools and the console if you want to see the *real* error and not this mess. Only proceed if you like nerdy JavaScript error messages!</li>" +
    "<li>🤖 <strong>AI wrote some code:</strong> Bug fixes and some improvements sometimes are fixed by AI, sometimes it does it, sometimes it fails horribly.</li>" +
    "<li>💻 <strong>Localhost test fail:</strong> Developers, did you *forget to run that localhost server again*? Sometimes that issue is the most likely if you're using localhost, not an actual code issue.</li>" +
    "<li>❌ <strong>Your schools internet filter:</strong> At school? Your school internet usually has a site blocker installed with it. It most likley would be that if you tried everything else above. Usually blockers might initially block because its a newly seen domain, a few days wait should fix. Otherwise your school said that Random Rants+ is against school polices.</li>" +
    "</ul>" +
    "<br>" +
    "<button onclick='window.location.reload()'>🔄 Refresh now</button>" +
    ' <button onclick=\'window.open("https://github.com/random-rants-chat/randomrants-plus/issues", "_blank")\'>🐛 Write a bug report (Requires github account)</button>' +
    "<p><i>If everything is still broken, you've unlocked the bad ending.</i></p>" +
    "<hr>" +
    "<pre style='white-space: pre-wrap; word-break: break-word; background:#222; color:#fff; padding:10px; border-radius:10px; font-size: 14px;'>" +
    "Simpler but still complex nerdy technical error:\n" +
    e +
    "</pre>";

  console.error("🚨 Random Rants+ randomly crashed:\n", e);
}

module.exports = handleErrors;
