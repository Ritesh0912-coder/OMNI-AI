const hfToken = process.env.HF_TOKEN;

export interface GeneratedImage {
    url: string;
    description: string;
    model: string;
}

/**
 * Robust Image Generation Service for OMNI
 * Priority:
 * 1. Hugging Face Inference API (SDXL Base 1.0)
 * 2. Pollinations.ai (Fallback)
 */
export async function generateImage(prompt: string, negativePrompt?: string): Promise<GeneratedImage | null> {
    console.log(`[IMAGE_GEN] 🎨 Requesting image for: "${prompt.substring(0, 50)}..."`);
    if (negativePrompt) console.log(`[IMAGE_GEN] 🚫 Negative Prompt: "${negativePrompt.substring(0, 50)}..."`);

    // 1. Try Hugging Face (High Quality)
    if (hfToken && hfToken.startsWith('hf_')) {
        try {
            console.log("[IMAGE_GEN] 🚀 Attempting Hugging Face (SDXL)...");
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
                        parameters: {
                            negative_prompt: negativePrompt || "blur, low quality, distorted, extra limbs, watermark, text"
                        },
                        options: {
                            wait_for_model: true,
                            use_cache: false
                        }
                    }),
                }
            );

            if (response.ok) {
                const blob = await response.blob();
                const arrayBuffer = await blob.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const base64 = buffer.toString('base64');
                const dataUrl = `data:${blob.type};base64,${base64}`;

                console.log("[IMAGE_GEN] ✅ Hugging Face Success!");
                return {
                    url: dataUrl,
                    description: prompt,
                    model: "SDXL-1.0 (Hugging Face)"
                };
            } else {
                const errorText = await response.text();
                console.warn(`[IMAGE_GEN] ⚠️ Hugging Face Error (${response.status}):`, errorText.substring(0, 200));
            }
        } catch (error: any) {
            console.error("[IMAGE_GEN] ❌ Hugging Face Exception:", error.message);
        }
    } else {
        console.log("[IMAGE_GEN] ℹ️ HB_TOKEN missing or invalid. Skipping Hugging Face.");
    }

    // 2. Fallback: Pollinations.ai (Reliable, Lower Quality)
    try {
        console.log("[IMAGE_GEN] 🔄 Attempting Fallback (Pollinations.ai)...");
        const encodedPrompt = encodeURIComponent(prompt + (negativePrompt ? ` | negative_prompt: ${negativePrompt}` : ""));
        const seed = Math.floor(Math.random() * 1000000);
        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;

        console.log("[IMAGE_GEN] ✅ Fallback URL Generated");
        return {
            url: fallbackUrl,
            description: prompt,
            model: "Pollinations (Flux)"
        };
    } catch (fallbackError) {
        console.error("[IMAGE_GEN] 💥 CRITICAL: All image generation methods failed.", fallbackError);
    }

    return null;
}
