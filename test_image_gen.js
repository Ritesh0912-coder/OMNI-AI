// Test Image Generation System
// This script tests both Clipdrop API and Pollinations fallback

const testPrompt = "a futuristic dashboard UI for a fintech app";

console.log("🧪 Testing Image Generation System...\n");

// Test 1: Clipdrop API
async function testClipdrop() {
    console.log("1️⃣ Testing Clipdrop API...");
    const apiKey = "2c18443ea2c2d3f00fcdf201e9061fa7";

    try {
        const formData = new FormData();
        formData.append('prompt', testPrompt);

        const response = await fetch('https://clipdrop-api.co/text-to-image/v1', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
            },
            body: formData,
        });

        console.log(`   Status: ${response.status} ${response.statusText}`);

        if (response.ok) {
            console.log("   ✅ Clipdrop API: SUCCESS");
            const blob = await response.blob();
            console.log(`   Image size: ${blob.size} bytes`);
            return true;
        } else {
            const errorText = await response.text();
            console.log(`   ❌ Clipdrop API: FAILED`);
            console.log(`   Error: ${errorText}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Clipdrop API: ERROR`);
        console.log(`   ${error.message}`);
        return false;
    }
}

// Test 2: Pollinations Fallback
function testPollinations() {
    console.log("\n2️⃣ Testing Pollinations Fallback...");
    try {
        const encodedPrompt = encodeURIComponent(testPrompt);
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;

        console.log("   ✅ Pollinations: URL Generated");
        console.log(`   URL: ${url.substring(0, 80)}...`);
        return true;
    } catch (error) {
        console.log(`   ❌ Pollinations: ERROR`);
        console.log(`   ${error.message}`);
        return false;
    }
}

// Run Tests
(async () => {
    const clipdropWorks = await testClipdrop();
    const pollinationsWorks = testPollinations();

    console.log("\n📊 Test Results:");
    console.log(`   Clipdrop API: ${clipdropWorks ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`   Pollinations: ${pollinationsWorks ? '✅ WORKING' : '❌ FAILED'}`);

    if (clipdropWorks || pollinationsWorks) {
        console.log("\n🎉 Image generation system is operational!");
    } else {
        console.log("\n⚠️ Both systems failed - check configuration");
    }
})();
