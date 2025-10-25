/**
 * SIMPLE PERPLEXITY TEST - Find Working Models
 *
 * Tests different model names to find which ones work with your API key
 */

import OpenAI from "openai";

// Load .env
import dotenv from "dotenv";
dotenv.config();

const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

// Models to test
const modelsToTest = ["sonar", "sonar-pro", "sonar-reasoning"];

async function testModel(model: string) {
  console.log(`\nTesting model: ${model}`);
  console.log("─".repeat(60));

  try {
    const response = await perplexity.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say 'Hello World' and nothing else." },
      ],
    });

    const answer = response.choices[0].message.content;
    console.log("✅ SUCCESS!");
    console.log(`Response: ${answer}`);
    return true;
  } catch (error: unknown) {
    console.log("❌ FAILED");
    const err = error as { status?: number; message?: string };
    if (err.status === 400) {
      console.log(`Reason: Invalid model`);
    } else {
      console.log(`Error: ${err.message || "Unknown error"}`);
    }
    return false;
  }
}

async function findWorkingModels() {
  console.log("🔍 Testing Perplexity Models...\n");
  console.log("═".repeat(60));

  const workingModels: string[] = [];

  for (const model of modelsToTest) {
    const works = await testModel(model);
    if (works) {
      workingModels.push(model);
    }
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n═".repeat(60));
  console.log("\n🎉 Working Models Found:");
  if (workingModels.length > 0) {
    for (const model of workingModels) {
      console.log(`   ✅ ${model}`);
    }
  } else {
    console.log("   ❌ No working models found");
    console.log(
      "   Check your API key or visit: https://docs.perplexity.ai/getting-started/models"
    );
  }
  console.log("\n");
}

// Use void to properly handle promise
void findWorkingModels();
