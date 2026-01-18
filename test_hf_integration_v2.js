
const fs = require('fs');
const path = require('path');

// Manually parse .env file
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8');
            envConfig.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    process.env[key.trim()] = value.trim();
                }
            });
            console.log("✅ Loaded .env file");
        }
    } catch (e) {
        console.error("⚠️ Could not load .env file:", e.message);
    }
}

loadEnv();

async function testImageGen() {
    const hfToken = process.env.HF_TOKEN;
    console.log("🧪 Testing Robust Image Generation...");
    console.log(`   HF_TOKEN Present: ${!!hfToken}`);
    if (hfToken) console.log(`   Token prefix: ${hfToken.substring(0, 3)}...`);

    const prompt = "A futuristic cyberpunk city with neon lights, high fidelity, 8k";

    if (hfToken && hfToken.startsWith('hf_')) {
        try {
            console.log("\n1️⃣  Testing Hugging Face (SDXL)...");
            const modelId = "stabilityai/stable-diffusion-xl-base-1.0";

            const response = await fetch(
                `https://router.huggingface.co/hf-inference/models/${modelId}`,
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
                // Check if it's the "model loading" error which is actually a success-in-progress indicator usually
                if (text.includes("is currently loading")) {
                    console.log(`   ⏳ Model is loading (Status ${response.status}). This counts as a CONNECTION SUCCESS for the API key.`);
                } else {
                    console.log(`   ❌ Failed. Status: ${response.status}`);
                    console.log(`   Error: ${text}`);
                }
            }
        } catch (error) {
            console.log(`   ❌ Exception: ${error.message}`);
        }
    } else {
        console.log("   ⚠️ Skipping Hugging Face (No valid token)");
    }

    console.log("\n2️⃣  Testing Fallback (Pollinations)...");
    const encodedPrompt = encodeURIComponent(prompt);
    // Add distinct seed
    const seed = Math.floor(Math.random() * 1000000);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;
    console.log(`   ✅ Fallback URL: ${url}`);
}

testImageGen();
