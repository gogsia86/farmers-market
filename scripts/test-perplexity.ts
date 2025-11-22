/**
 * PERPLEXITY API TEST SCRIPT
 * Quick verification that Perplexity integration is working
 */

import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function testPerplexityAPI() {
  console.log("🧪 Testing Perplexity API Integration\n");

  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    console.error("❌ PERPLEXITY_API_KEY not found in environment");
    process.exit(1);
  }

  console.log(
    `✅ API Key found: ${apiKey.substring(0, 10)}...${apiKey.slice(-4)}`
  );

  try {
    console.log("\n🔍 Sending test query to Perplexity...\n");

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "user",
            content:
              "What are the best practices for organic tomato farming? Please provide a brief answer.",
          },
        ],
        temperature: 0.2,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: "month",
        top_k: 0,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ API Error (${response.status}):`, errorData);
      process.exit(1);
    }

    const data = await response.json();

    console.log("✅ Perplexity API Response Successful!\n");
    console.log("📊 Response Details:");
    console.log(`   Model: ${data.model}`);
    console.log(`   Tokens Used: ${data.usage?.total_tokens || "N/A"}`);
    console.log(`   Citations: ${data.citations?.length || 0}`);
    console.log(
      `   Related Questions: ${data.related_questions?.length || 0}\n`
    );

    console.log("💬 Answer:");
    console.log("─".repeat(60));
    console.log(data.choices[0]?.message?.content || "No content");
    console.log("─".repeat(60));

    if (data.citations && data.citations.length > 0) {
      console.log("\n📚 Citations:");
      data.citations.forEach((citation: string, index: number) => {
        console.log(`   ${index + 1}. ${citation}`);
      });
    }

    if (data.related_questions && data.related_questions.length > 0) {
      console.log("\n❓ Related Questions:");
      data.related_questions.forEach((question: string, index: number) => {
        console.log(`   ${index + 1}. ${question}`);
      });
    }

    console.log("\n🌟 Perplexity integration is working perfectly!");
  } catch (error) {
    console.error("❌ Error testing Perplexity API:", error);
    process.exit(1);
  }
}

testPerplexityAPI();
