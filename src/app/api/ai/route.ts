import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { query } = await req.json();
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
                            { "role": "system", "content": "You are Synapse, a helpful AI browser assistant. Provide a concise, 2-paragraph summary of the user's search query, based on general knowledge." },
                            { "role": "user", "content": query }
                        ]
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
