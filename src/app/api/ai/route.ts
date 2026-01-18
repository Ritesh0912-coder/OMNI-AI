import { NextResponse } from 'next/server';
import { BROWSER_BRAIN_PROMPT } from '@/lib/synapse-prompts';

export async function POST(req: Request) {
    try {
        const { query, context } = await req.json();
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            console.error("[AI_ROUTE] Missing OPENROUTER_API_KEY on server");
            return NextResponse.json({ error: "OpenRouter API Key missing on server" }, { status: 500 });
        }

        const models = [
            "deepseek/deepseek-chat:free",
            "google/gemini-2.0-flash-exp:free",
            "meta-llama/llama-3.3-70b-instruct:free",
            "google/gemini-2.0-flash-thinking-exp:free",
            "qwen/qwen-2.5-72b-instruct:free",
            "microsoft/phi-3-medium-128k-instruct:free"
        ];

        const systemPrompt = `
${BROWSER_BRAIN_PROMPT}

${context ? `CORE DATA NODES (REAL-TIME SEARCH CONTEXT):
${context}

Instructions:
1. Synthesize the provided search results into OMNI intelligence.
2. Follow the mandated structure exactly.` : "Provide OMNI decision intelligence based on your extensive knowledge base."}
`;

        for (const model of models) {
            try {
                console.log(`[AI_ROUTE] Probing OMNI Intelligence with: ${model}...`);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

                const messages: any[] = [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": query }
                ];

                // SYSTEM OVERRIDE: Force Image Generation Tag for Visual Queries
                if (/image|generate|visual|design|mockup|sketch|draw|picture/i.test(query)) {
                    messages.push({
                        "role": "system",
                        "content": `SYSTEM OVERRIDE: The user has requested a visual. You MUST generate it. 
                        Do not say "I cannot create images". 
                        Instead, provide the description and append the tag: [[GENERATE_IMAGE: <detailed_prompt>]] at the end.`
                    });
                }

                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://synapse-browser.ai",
                        "X-Title": "OMNI Browser Brain"
                    },
                    body: JSON.stringify({
                        "model": model,
                        "messages": messages,
                        "max_tokens": 1500,
                        "temperature": 0.4
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    if (data.error) {
                        console.error(`[AI_ROUTE] API returned 200 but contained error for ${model}:`, data.error);
                        continue;
                    }
                    const content = data.choices?.[0]?.message?.content;
                    if (content) {
                        console.log(`[AI_ROUTE] Success with model: ${model}`);

                        // FORCE INJECTION: If user wanted image but AI didn't provide tag, append it manually.
                        let finalContent = content;
                        if (/image|generate|visual|design|mockup|sketch|draw|picture/i.test(query) && !content.includes('[[GENERATE_IMAGE')) {
                            console.log("[AI_ROUTE] Injecting missing GENERATE_IMAGE tag...");
                            finalContent += `\n\n[[GENERATE_IMAGE: ${query}]]`;
                        }

                        return NextResponse.json({ content: finalContent });
                    } else {
                        console.error(`[AI_ROUTE] Unexpected response structure for ${model}:`, JSON.stringify(data).substring(0, 200));
                    }
                } else if (response.status === 429) {
                    console.warn(`[AI_ROUTE] Rate limited on ${model}. Switching fallback...`);
                    continue;
                } else {
                    const errText = await response.text();
                    console.warn(`[AI_ROUTE] ${model} failed (Status ${response.status}):`, errText.substring(0, 200));
                }
            } catch (e: any) {
                if (e.name === 'AbortError') {
                    console.error(`[AI_ROUTE] Timeout with model ${model}`);
                } else {
                    console.error(`[AI_ROUTE] Network error with ${model}:`, e);
                }
            }
        }

        console.error("[AI_ROUTE] CRITICAL: All fallback models exhausted.");
        return NextResponse.json({
            error: "OMNI Intelligence is currently experiencing high demand. Our distributed fallback system has exhausted all free nodes.",
            details: "Please retry in 10-15 seconds. Upgrading to a paid OpenRouter model would provide 100% stability."
        }, { status: 503 });

    } catch (error) {
        console.error("[AI_ROUTE] Critical API Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
