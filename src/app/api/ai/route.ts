import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { query, context } = await req.json();
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            console.error("Missing OPENROUTER_API_KEY on server");
            return NextResponse.json({ error: "OpenRouter API Key missing on server" }, { status: 500 });
        }

        const models = [
            "google/gemini-2.0-flash-exp:free",
            "mistralai/mistral-7b-instruct:free",
            "meta-llama/llama-3-8b-instruct:free",
            "microsoft/phi-3-mini-128k-instruct:free"
        ];

        const systemPrompt = `You are SYNAPSE AI, a high-performance Real-Time Decision Intelligence Engine.
Your task is to provide a sharp, highly analytical summary of the user's query.

${context ? `CORE DATA NODES (REAL-TIME SEARCH CONTEXT):
${context}

Instructions:
1. Synthesize the provided search results into a cohesive intelligence report.
2. Focus on facts, trends, and practical implications.
3. Maintain a professional, executive tone.
4. If the results are irrelevant or contradictory, highlight the uncertainty.` : "Provide a concise, analytical summary based on your internal knowledge base."}

FORMATTING:
- NO headers.
- MAX 2-3 paragraphs.
- Bold key terms or metrics.
- Address the user's intent with precision.`;

        for (const model of models) {
            try {
                console.log(`Trying model: ${model}...`);
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "Synapse Browser"
                    },
                    body: JSON.stringify({
                        "model": model,
                        "messages": [
                            { "role": "system", "content": systemPrompt },
                            { "role": "user", "content": query }
                        ],
                        "max_tokens": 1024,
                        "temperature": 0.5
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const content = data.choices[0]?.message?.content;
                    if (content) {
                        console.log(`Success with model: ${model}`);
                        return NextResponse.json({ content });
                    }
                } else {
                    const errText = await response.text();
                    console.warn(`Model ${model} failed: ${response.status} ${response.statusText}`, errText);
                    if (response.status !== 429 && response.status !== 503) {
                        // If it's not a rate limit or temp availability issue, maybe don't retry? 
                        // But for safety in a "browser" context, simpler to just try the next one.
                    }
                }
            } catch (e) {
                console.error(`Error with model ${model}:`, e);
            }
        }

        return NextResponse.json({ error: "All AI models failed to respond." }, { status: 503 });

    } catch (error) {
        console.error("AI API Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
