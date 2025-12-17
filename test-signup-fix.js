/**
 * TEST SIGNUP FIX
 * Quick script to test the signup endpoint and verify the fix
 */

const http = require("http");

const testSignup = () => {
  const data = JSON.stringify({
    name: "Test User",
    email: `test${Date.now()}@example.com`,
    password: "SecurePass123!",
    userType: "CONSUMER",
  });

  const options = {
    hostname: "localhost",
    port: 3001,
    path: "/api/auth/signup",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  console.log("🧪 Testing Signup API...");
  console.log("📝 Request:", JSON.parse(data));
  console.log("");

  const req = http.request(options, (res) => {
    let responseData = "";

    res.on("data", (chunk) => {
      responseData += chunk;
    });

    res.on("end", () => {
      console.log(`📊 Status Code: ${res.statusCode}`);
      console.log("📦 Response:");
      try {
        const json = JSON.parse(responseData);
        console.log(JSON.stringify(json, null, 2));

        if (res.statusCode === 201) {
          console.log("\n✅ SUCCESS! Signup is working correctly!");
        } else {
          console.log("\n❌ FAILED! Status code:", res.statusCode);
        }
      } catch (e) {
        console.log(responseData);
        console.log("\n❌ FAILED! Invalid JSON response");
      }
    });
  });

  req.on("error", (error) => {
    console.error("❌ Request failed:", error.message);
    console.log("\n💡 Tip: Make sure the server is running on port 3001");
    console.log("   Run: npm run start");
  });

  req.write(data);
  req.end();
};

// Test health endpoint first
const testHealth = (callback) => {
  console.log("🏥 Checking server health...");

  http
    .get("http://localhost:3001/api/health", (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 200) {
          console.log("✅ Server is healthy\n");
          callback();
        } else {
          console.log("⚠️ Server health check failed");
          callback();
        }
      });
    })
    .on("error", (err) => {
      console.error("❌ Cannot connect to server:", err.message);
      console.log("\n💡 Start the server with: npm run start");
      process.exit(1);
    });
};

// Run tests
testHealth(() => {
  testSignup();
});
