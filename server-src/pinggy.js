const { spawn } = require('node:child_process');

// Configuration
let serverPort = process.env.PORT || process.env.serverPort || 3000;
const filterLinks = ["https://dashboard.pinggy.io", "https://pinggy.io"];
const maxPinggy = 10; // Total concurrent tunnels

const commandArgs = [
    ['ssh', [
        '-p', '443',
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'ServerAliveInterval=30',
        '-R', `0:localhost:${serverPort}`,
        '-L', '4300:127.0.0.1:4300',
        'qr@free.pinggy.io'
    ]]
];

var activeTunnels = new Map(); 
var curPinggy = 0;

function spawnTunnel(index) {
    if (curPinggy >= maxPinggy) return;
    
    curPinggy += 1;
    const [cmdName, args] = commandArgs[index];
    const child = spawn(cmdName, args);
    const pid = child.pid;

    child.stdout.on('data', (data) => {
        const output = data.toString();
        
        // Improved URL regex to catch URLs even if they are surrounded by ANSI codes
        const urlRegex = /https:\/\/[^\s"'<>]+/g;
        const foundLinks = output.match(urlRegex);

        if (foundLinks) {
            foundLinks.forEach(link => {
                const s = link.trim().replace(/\x1B\[[0-9;]*[mK]/g, ""); // Clean ANSI colors
                
                if (!filterLinks.some(f => s.startsWith(f)) && !activeTunnels.has(pid)) {
                    activeTunnels.set(pid, { 
                        url: s, 
                        ts: Date.now() 
                    });
                }
            });
        }
    });

    // Capture errors to help with debugging
    child.stderr.on('data', (data) => {
        if (data.toString().includes("Permission denied")) {
            console.error(`[Error] PID ${pid} check your SSH keys.`);
        }
    });

    child.on('close', (code) => {
        curPinggy -= 1;
        activeTunnels.delete(pid);
        
        // Staggered restart to avoid spamming the CPU
        setTimeout(() => {
            spawnTunnel(index);
        }, 5000);
    });
}

// Initial Boot
for (let i = 0; i < maxPinggy; i++) {
    // Distribute processes evenly across providers
    spawnTunnel(i % commandArgs.length);
}

function getActiveAltLinks() {
    return Array.from(activeTunnels.values());
}

module.exports = { getActiveAltLinks };