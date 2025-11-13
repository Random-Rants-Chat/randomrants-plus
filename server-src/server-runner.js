const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const LOG_DIR = path.resolve(__dirname, "../", "crashlogs");
const SERVER_SCRIPT = path.resolve(__dirname, "server.js");

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function logCrash(errorData) {
  const filename = `crash_${getTimestamp()}.txt`;
  const filePath = path.join(LOG_DIR, filename);
  const content = [
    `Crash time: ${new Date().toISOString()}`,
    "",
    "Error output:",
    errorData,
  ].join("\n");

  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error("Failed to write crash log:", err);
    } else {
      console.log(`Crash log saved to ${filePath}`);
    }
  });
}

function startServer() {
  console.log("Starting server...");

  const child = spawn("node", [SERVER_SCRIPT], {
    stdio: ["inherit", "inherit", "pipe"], // Inherit stdin/stdout, capture stderr
  });

  let stderrData = "";

  child.stderr.on("data", (data) => {
    stderrData += data.toString();
  });

  child.on("exit", (code, signal) => {
    if (code !== 0) {
      console.error(`Server crashed with code ${code} and signal ${signal}`);
      logCrash(stderrData || `Exit code: ${code}, signal: ${signal}`);
    } else {
      console.log(`Server exited gracefully with code ${code}`);
    }
    setTimeout(startServer, 1000);
  });

  child.on("error", (err) => {
    console.error("Failed to start server:", err);
    logCrash(err.stack || err.message || String(err));
    setTimeout(startServer, 1000);
  });
}

startServer();
