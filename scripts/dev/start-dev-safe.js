#!/usr/bin/env node

/**
 * Safe Dev Server Starter
 * Ensures ports are clear before starting Next.js dev server
 * Automatically handles port conflicts and provides clear feedback
 */

const { exec, spawn } = require("child_process");
const { platform } = require("os");
const http = require("http");

const DEFAULT_PORT = 3000;
const FALLBACK_PORTS = [3001, 3002, 3003, 3004];
const isWindows = platform() === "win32";

console.log(`
╔════════════════════════════════════════════════════════════╗
║  🚀 Safe Dev Server Starter                                ║
║  Farmers Market Platform - Divine Agricultural Testing    ║
╚════════════════════════════════════════════════════════════╝
`);

/**
 * Check if a port is in use
 */
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = http.createServer();

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    server.once("listening", () => {
      server.close();
      resolve(false);
    });

    server.listen(port);
  });
}

/**
 * Find process using a specific port
 */
function findProcessOnPort(port) {
  return new Promise((resolve, _reject) => {
    let command;

    if (isWindows) {
      command = `netstat -ano | findstr :${port}`;
    } else {
      command = `lsof -ti :${port}`;
    }

    exec(command, (error, stdout, _stderr) => {
      if (error) {
        resolve(null);
        return;
      }

      if (isWindows) {
        const lines = stdout.trim().split("\n");
        const pids = new Set();

        lines.forEach((line) => {
          const match = line.match(/LISTENING\s+(\d+)/);
          if (match) {
            pids.add(match[1]);
          }
        });

        resolve(Array.from(pids));
      } else {
        const pids = stdout.trim().split("\n").filter(Boolean);
        resolve(pids);
      }
    });
  });
}

/**
 * Kill process by PID
 */
function killProcess(pid) {
  return new Promise((resolve, reject) => {
    let command;

    if (isWindows) {
      command = `taskkill /F /PID ${pid}`;
    } else {
      command = `kill -9 ${pid}`;
    }

    exec(command, (error, _stdout, _stderr) => {
      if (error) {
        reject(new Error(`Failed to kill process ${pid}`));
        return;
      }
      resolve(true);
    });
  });
}

/**
 * Clear port by killing processes
 */
async function clearPort(port) {
  console.log(`🔍 Checking port ${port}...`);

  const pids = await findProcessOnPort(port);

  if (!pids || pids.length === 0) {
    console.log(`   ✅ Port ${port} is available\n`);
    return true;
  }

  console.log(`   ⚠️  Found ${pids.length} process(es) using port ${port}`);
  console.log("   🔪 Attempting to kill processes...");

  let killed = 0;
  for (const pid of pids) {
    try {
      await killProcess(pid);
      console.log(`      ✅ Killed PID: ${pid}`);
      killed++;
    } catch (_err) {
      console.log(`      ❌ Failed to kill PID: ${pid}`);
    }
  }

  // Wait a moment for ports to be released
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Verify port is now free
  const stillInUse = await isPortInUse(port);
  if (stillInUse) {
    console.log(`   ❌ Port ${port} still in use after cleanup\n`);
    return false;
  }

  console.log(`   ✅ Port ${port} is now available\n`);
  return true;
}

/**
 * Find available port
 */
async function findAvailablePort() {
  // Try default port first
  console.log(`🎯 Attempting to use default port ${DEFAULT_PORT}...\n`);

  const defaultInUse = await isPortInUse(DEFAULT_PORT);

  if (!defaultInUse) {
    console.log(`✅ Port ${DEFAULT_PORT} is available!\n`);
    return DEFAULT_PORT;
  }

  console.log(`⚠️  Port ${DEFAULT_PORT} is in use`);

  // Try to clear the default port
  const cleared = await clearPort(DEFAULT_PORT);
  if (cleared) {
    return DEFAULT_PORT;
  }

  // Try fallback ports
  console.log("🔍 Searching for alternative port...\n");

  for (const port of FALLBACK_PORTS) {
    const inUse = await isPortInUse(port);
    if (!inUse) {
      console.log(`✅ Found available port: ${port}\n`);
      return port;
    }
  }

  // No ports available
  throw new Error("No available ports found");
}

/**
 * Start Next.js dev server
 */
function startDevServer(port) {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log(
    `║  🚀 Starting Next.js Dev Server on port ${port}              ║`,
  );
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );

  const nodeOptions = process.env.NODE_OPTIONS || "--max-old-space-size=16384";
  const cmd = isWindows ? "npx.cmd" : "npx";

  const devServer = spawn(cmd, ["next", "dev", "-p", port.toString()], {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      NODE_OPTIONS: nodeOptions,
      PORT: port.toString(),
    },
  });

  devServer.on("error", (err) => {
    console.error("\n❌ Failed to start dev server:", err);
    process.exit(1);
  });

  devServer.on("exit", (code, signal) => {
    if (code !== 0 && code !== null) {
      console.log(`\n⚠️  Dev server exited with code ${code}`);
    }
    if (signal) {
      console.log(`\n⚠️  Dev server killed with signal ${signal}`);
    }
  });

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n\n🛑 Shutting down dev server...");
    devServer.kill("SIGTERM");
    setTimeout(() => {
      devServer.kill("SIGKILL");
      process.exit(0);
    }, 5000);
  });

  process.on("SIGTERM", () => {
    console.log("\n\n🛑 Shutting down dev server...");
    devServer.kill("SIGTERM");
    setTimeout(() => {
      devServer.kill("SIGKILL");
      process.exit(0);
    }, 5000);
  });
}

/**
 * Main execution
 */
async function main() {
  try {
    // Find available port
    const port = await findAvailablePort();

    // Start dev server
    startDevServer(port);
  } catch (err) {
    console.error("\n❌ Fatal error:", err.message);
    console.log("\n💡 Try manually killing processes:");
    console.log("   npm run kill-server -- --all\n");
    process.exit(1);
  }
}

// Run main function
main();
