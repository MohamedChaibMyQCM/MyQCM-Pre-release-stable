const path = require("node:path");
const dotenv = require("dotenv");
let killPort;

try {
  killPort = require("kill-port");
} catch (error) {
  console.warn(
    "[free-port] 'kill-port' dependency missing; skipping automatic port cleanup.",
  );
  process.exit(0);
}

// Load backend-specific environment variables to resolve the target port.
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const defaultPort = 3000;
const envPort = Number(process.env.APP_PORT);
const port = Number.isFinite(envPort) ? envPort : defaultPort;

async function freePort(targetPort) {
  try {
    await killPort(targetPort);
    console.log(`[free-port] Freed port ${targetPort}`);
  } catch (error) {
    const message = (error && error.message) || "";
    // Ignore errors that indicate the port was already free.
    if (
      message.includes("No running process")
      || message.includes("connect ECONNREFUSED")
    ) {
      return;
    }

    console.warn(`[free-port] Unable to free port ${targetPort}: ${message}`);
  }
}

freePort(port).catch((error) => {
  console.warn(`[free-port] Unexpected error while freeing port ${port}: ${error.message}`);
});
