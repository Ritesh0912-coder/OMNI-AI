
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Manually parse .env file (copying logic from previous test)
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

const IMAGE_GENERATION_SYSTEM_PROMPT = `
You are OMNI Image Generator AI.
Your task is to convert any user text into a highly detailed, visually accurate image description that can be directly used by an internal image generation engine.

You must:
- Understand the user's intent clearly
- Expand vague input into rich visual detail
- Describe colors, lighting, style, camera angle, mood, environment
- NEVER ask questions unless input is completely empty
- NEVER refuse normal creative requests
- ALWAYS output a single final image prompt

Analyze the text and infer:
1. Subject (person / object / place / abstract)
2. Style (realistic, anime, ghibli, cyberpunk, oil painting, sketch, 3D, minimal)
3. Environment (indoor, outdoor, city, nature, fantasy world)
4. Lighting (soft, cinematic, dramatic, neon, natural sunlight)
5. Colors (dominant + accent colors)
6. Camera (close-up, wide-angle, portrait, top view, depth of field)
7. Mood (happy, dark, calm, powerful, futuristic)

OUTPUT FORMAT:
[MAIN IMAGE PROMPT]
A highly detailed description of the image in natural language...

[STYLE TAGS]
comma-separated style tags...

[QUALITY BOOST]
ultra-detailed, high resolution, sharp focus, professional composition

[NEGATIVE PROMPT]
blur, low quality, distorted face, extra limbs, noise, watermark, text
`;

async function testPromptExpansion() {
    console.log("🧪 Testing OMNI Image Prompt Expansion...");

    // Check available keys
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error("❌ No LLM API Key found (check OPENROUTER_API_KEY or OPENAI_API_KEY)");
        return;
    }

    const baseURL = process.env.OPENROUTER_API_KEY ? "https://openrouter.ai/api/v1" : undefined;
    const model = process.env.OPENROUTER_API_KEY ? "openai/gpt-4o-mini" : "gpt-4o-mini";

    console.log(`   Using Model: ${model}`);

    const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: baseURL
    });

    const testInput = "a cool cyberpunk car";
    console.log(`\n📝 Input: "${testInput}"`);

    try {
        const response = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: IMAGE_GENERATION_SYSTEM_PROMPT },
                { role: "user", content: testInput }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const output = response.choices[0].message.content;
        console.log("\n✨ OMNI Output:\n", output);

        // Verify parsing logic
        const extractSection = (text, header) => {
            const regex = new RegExp(`\\[${header}\\]\\s*([\\s\\S]*?)(?=\\[|$)`, 'i');
            const match = text.match(regex);
            return match ? match[1].trim() : "";
        };

        const main = extractSection(output, "MAIN IMAGE PROMPT");
        const neg = extractSection(output, "NEGATIVE PROMPT");

        if (main && neg) {
            console.log("\n✅ Parsing Success!");
            console.log("   Main Prompt:", main.substring(0, 50) + "...");
            console.log("   Negative:", neg.substring(0, 50) + "...");
        } else {
            console.log("\n⚠️ Parsing Warning: Could not extract sections perfectly.");
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

testPromptExpansion();
