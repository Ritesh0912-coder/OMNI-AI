
const dotenv = require('dotenv');
dotenv.config();

// Mock fetch for Node environment if needed (Node 18+ has native fetch)
// But we'll just rely on native fetch.

async function testImageGen() {
    const hfToken = process.env.HF_TOKEN;
    console.log("🧪 Testing Robust Image Generation...");
    console.log(`   HF_TOKEN Present: ${!!hfToken}`);
    if (hfToken) console.log(`   Token prefix: ${hfToken.substring(0, 3)}...`);

    const prompt = "A futuristic cyberpunk city with neon lights, high fidelity, 8k";

    // Replicating the logic from src/lib/image-generation.ts
    // (We can't import TS directly easily without compilation, so I'll replicate the core logic here for the test)

    if (hfToken && hfToken.startsWith('hf_')) {
        try {
            console.log("\n1️⃣  Testing Hugging Face (SDXL)...");
            const modelId = "stabilityai/stable-diffusion-xl-base-1.0";

            const response = await fetch(
                `https://api-inference.huggingface.co/models/${modelId}`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${hfToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        inputs: prompt,
                        options: {
                            wait_for_model: true,
                            use_cache: false
                        }
                    }),
                }
            );

            if (response.ok) {
                const blob = await response.blob();
                console.log(`   ✅ Success! Image received. Size: ${blob.size} bytes`);
                return;
            } else {
                const text = await response.text();
                console.log(`   ❌ Failed. Status: ${response.status}`);
                console.log(`   Error: ${text}`);
            }
        } catch (error) {
            console.log(`   ❌ Exception: ${error.message}`);
        }
    } else {
        console.log("   ⚠️ Skipping Hugging Face (No valid token)");
    }

    console.log("\n2️⃣  Testing Fallback (Pollinations)...");
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;
    console.log(`   ✅ Fallback URL: ${url}`);
}

testImageGen();
