#!/usr/bin/env node

/**
 * Kill Dev Server Utility
 * Finds and terminates processes on development ports (3000, 3001)
 * Supports Windows, Linux, and macOS
 */

const { exec } = require("child_process");
const { platform } = require("os");

const PORTS = [3000, 3001, 3002, 3003, 5000, 8000, 8080];
const isWindows = platform() === "win32";

console.log(`
╔════════════════════════════════════════════════════════════╗
║  🔪 Kill Dev Server - Farmers Market Platform             ║
║  Terminate processes on development ports                 ║
╚════════════════════════════════════════════════════════════╝
`);

/**
 * Find process using a specific port
 */
function findProcessOnPort(port) {
  return new Promise((resolve, reject) => {
    let command;

    if (isWindows) {
      command = `netstat -ano | findstr :${port}`;
    } else {
      command = `lsof -ti :${port}`;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        // No process found on this port
        resolve(null);
        return;
      }

      if (isWindows) {
        // Parse Windows netstat output
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
        // Parse Unix lsof output
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

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Failed to kill process ${pid}: ${error.message}`));
        return;
      }
      resolve(true);
    });
  });
}

/**
 * Main execution
 */
/**
 * Kill all Node.js processes (nuclear option)
 */
function killAllNodeProcesses() {
  return new Promise((resolve, reject) => {
    let command;

    if (isWindows) {
      command = "taskkill /F /IM node.exe /T";
    } else {
      command = "killall -9 node";
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        // No node processes found is not an error
        resolve(0);
        return;
      }
      // Count processes killed
      const match = stdout.match(
        /SUCCESS: Sent termination signal to (\d+) process/,
      );
      resolve(match ? parseInt(match[1]) : 1);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const killAll = args.includes("--all") || args.includes("-a");

  if (killAll) {
    console.log(`⚠️  NUCLEAR OPTION: Killing ALL Node.js processes\n`);
    try {
      const killed = await killAllNodeProcesses();
      console.log(`✅ Killed all Node.js processes\n`);
      console.log(`💡 You can now start the dev server:`);
      console.log(`   npm run dev\n`);
      return;
    } catch (err) {
      console.log(`❌ Error killing Node processes: ${err.message}\n`);
      process.exit(1);
    }
  }

  console.log(`🔍 Scanning common development ports: ${PORTS.join(", ")}\n`);

  let totalKilled = 0;
  let portsWithProcesses = [];

  for (const port of PORTS) {
    console.log(`📍 Checking port ${port}...`);

    try {
      const pids = await findProcessOnPort(port);

      if (!pids || pids.length === 0) {
        console.log(`   ✅ Port ${port} is clear (no processes found)\n`);
        continue;
      }

      portsWithProcesses.push(port);
      console.log(`   ⚠️  Found ${pids.length} process(es) on port ${port}`);

      for (const pid of pids) {
        try {
          await killProcess(pid);
          console.log(`   ✅ Killed process PID: ${pid}`);
          totalKilled++;
        } catch (err) {
          console.log(`   ❌ Failed to kill PID ${pid}: ${err.message}`);
        }
      }

      console.log();
    } catch (err) {
      console.log(`   ❌ Error checking port ${port}: ${err.message}\n`);
    }
  }

  console.log(
    `\n╔════════════════════════════════════════════════════════════╗`,
  );
  if (totalKilled > 0) {
    const padding = " ".repeat(Math.max(0, 36 - totalKilled.toString().length));
    console.log(`║  ✅ Success! Killed ${totalKilled} process(es)${padding}║`);
    console.log(
      `║  Ports affected: ${portsWithProcesses.join(", ")}                              ║`,
    );
  } else {
    console.log(
      `║  ✅ All ports are clear - no processes to kill            ║`,
    );
  }
  console.log(
    `╚════════════════════════════════════════════════════════════╝\n`,
  );

  if (totalKilled > 0) {
    console.log(`💡 You can now start the dev server:`);
    console.log(`   npm run dev\n`);
  } else {
    console.log(`💡 All clear! Start the dev server with:`);
    console.log(`   npm run dev\n`);
    console.log(`⚠️  If you still have issues, try the nuclear option:`);
    console.log(`   npm run kill-server -- --all\n`);
  }
}

// Handle errors
process.on("uncaughtException", (err) => {
  console.error("\n❌ Unexpected error:", err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("\n❌ Unhandled rejection:", err.message);
  process.exit(1);
});

// Run main function
main().catch((err) => {
  console.error("\n❌ Fatal error:", err.message);
  process.exit(1);
});
