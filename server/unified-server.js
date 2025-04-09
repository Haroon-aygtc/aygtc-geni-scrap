const { spawn } = require("child_process");
const path = require("path");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Log with timestamp and color
function log(message, color = colors.reset) {
  const timestamp = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/, "");
  console.log(
    `${colors.dim}[${timestamp}]${colors.reset} ${color}${message}${colors.reset}`,
  );
}

// Handle process exit
function handleExit(code, process) {
  return () => {
    log(`${process} process exited with code ${code}`, colors.yellow);
  };
}

// Handle process error
function handleError(process) {
  return (err) => {
    log(`${process} process error: ${err}`, colors.red);
  };
}

// Start API server
function startApiServer() {
  log("Starting API server...", colors.cyan);
  const apiServer = spawn("node", ["server/api-server.js"], { stdio: "pipe" });

  apiServer.stdout.on("data", (data) => {
    log(`API: ${data}`.trim(), colors.cyan);
  });

  apiServer.stderr.on("data", (data) => {
    log(`API ERROR: ${data}`.trim(), colors.red);
  });

  apiServer.on("exit", (code) => handleExit(code, "API")());
  apiServer.on("error", handleError("API"));

  return apiServer;
}

// Start WebSocket server
function startWebSocketServer() {
  log("Starting WebSocket server...", colors.magenta);
  const wsServer = spawn("node", ["server/websocket-server.js"], {
    stdio: "pipe",
  });

  wsServer.stdout.on("data", (data) => {
    log(`WS: ${data}`.trim(), colors.magenta);
  });

  wsServer.stderr.on("data", (data) => {
    log(`WS ERROR: ${data}`.trim(), colors.red);
  });

  wsServer.on("exit", (code) => handleExit(code, "WebSocket")());
  wsServer.on("error", handleError("WebSocket"));

  return wsServer;
}

// Start Vite dev server
function startViteServer() {
  log("Starting Vite dev server...", colors.green);
  const viteServer = spawn("npm", ["run", "dev"], { stdio: "pipe" });

  viteServer.stdout.on("data", (data) => {
    log(`VITE: ${data}`.trim(), colors.green);
  });

  viteServer.stderr.on("data", (data) => {
    log(`VITE ERROR: ${data}`.trim(), colors.red);
  });

  viteServer.on("exit", (code) => handleExit(code, "Vite")());
  viteServer.on("error", handleError("Vite"));

  return viteServer;
}

// Main function to start all servers
async function startAllServers() {
  log("Starting all servers...", colors.bright);

  // Start servers
  const apiServer = startApiServer();
  const wsServer = startWebSocketServer();
  const viteServer = startViteServer();

  // Handle process termination
  const servers = [apiServer, wsServer, viteServer];

  process.on("SIGINT", () => {
    log("Received SIGINT. Shutting down all servers...", colors.yellow);
    servers.forEach((server) => server.kill());
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    log("Received SIGTERM. Shutting down all servers...", colors.yellow);
    servers.forEach((server) => server.kill());
    process.exit(0);
  });
}

// Start everything
startAllServers().catch((err) => {
  log(`Error starting servers: ${err}`, colors.red);
  process.exit(1);
});
