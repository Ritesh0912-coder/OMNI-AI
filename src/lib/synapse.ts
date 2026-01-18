"use client";

// Thesys AI Service Mock / Integration
// Replace with actual SDK usage or API endpoints

export interface SearchSuggestion {
    id: string;
    text: string;
    type: 'ai' | 'history' | 'web';
}

export interface PageSummary {
    title: string;
    summary: string;
    keyPoints: string[];
}

export interface SearchResult {
    id: string;
    title: string;
    url: string;
    snippet: string;
    source: string;
    image?: string;
    isAI?: boolean;
}

export interface SearchResponse {
    query: string;
    aiResponse: string;
    results: SearchResult[];
    images: { url: string; description: string }[];
    links: { title: string; url: string; description: string }[];
}




class SynapseAIService {
    private apiKey: string | undefined;

    constructor() {
        this.apiKey = process.env.NEXT_PUBLIC_SYNAPSE_API_KEY;
    }

    async getSuggestions(query: string): Promise<SearchSuggestion[]> {
        if (!query) return [];

        // Mocking AI suggestions
        const suggestions: SearchSuggestion[] = [
            { id: '1', text: `${query} stock analysis`, type: 'ai' },
            { id: '2', text: `${query} tutorial for beginners`, type: 'web' },
            { id: '3', text: `how to build ${query}`, type: 'ai' },
        ];

        return suggestions;
    }

    async summarizePage(url: string): Promise<PageSummary> {
        // Mocking page summarization
        return {
            title: "Summarized Page Content",
            summary: "This page discusses the advancements in AI technology and its impact on modern web browsing experiences.",
            keyPoints: [
                "AI-driven navigation improves speed.",
                "Real-time summarization aids comprehension.",
                "Privacy-focused browsing is the future."
            ]
        };
    }

    async getRecommendations(url: string): Promise<any[]> {
        return [
            { title: "The Future of AI Browsers", url: "https://example.com/future" },
            { title: "Next.js 15 Performance Tips", url: "https://example.com/nextjs" }
        ];
    }

    async performSearch(query: string): Promise<SearchResponse> {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY;
        const cx = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CX || "52cdfdc28b314462a";

        // 1. Start Google Search Request
        let googleData: any = null;
        if (apiKey && cx) {
            try {
                const response = await fetch(
                    `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`
                );
                googleData = await response.json();
            } catch (error) {
                console.error("Google Search API Error:", error);
            }
        }

        // 2. Prepare Context for AI
        let searchContext = "";

        // Google Search Context
        if (googleData && googleData.items) {
            searchContext = googleData.items
                .slice(0, 5)
                .map((item: any) => `Source: ${item.displayLink}\nTitle: ${item.title}\nSnippet: ${item.snippet}`)
                .join("\n\n");
        }
        // Fallback to SearchAPI (DuckDuckGo) if Google fails
        else {
            const searchApiUrl = process.env.SEARCHAPI_KEY; // User has URL in KEY var
            if (searchApiUrl && searchApiUrl.includes('searchapi.io')) {
                try {
                    // Start extraction of key if possible, or just append query if it's a full string
                    // Assuming format: https://www.searchapi.io/api/v1/search?engine=duckduckgo
                    // We need to append &q=...
                    const res = await fetch(`${searchApiUrl}&q=${encodeURIComponent(query)}`);
                    const ddgData = await res.json();
                    if (ddgData.organic_results) {
                        googleData = {
                            items: ddgData.organic_results.map((r: any) => ({
                                title: r.title,
                                link: r.link,
                                snippet: r.snippet,
                                displayLink: r.source || 'DuckDuckGo'
                            }))
                        };
                        searchContext = googleData.items
                            .slice(0, 5)
                            .map((item: any) => `Source: ${item.displayLink}\nTitle: ${item.title}\nSnippet: ${item.snippet}`)
                            .join("\n\n");
                    }
                } catch (e) {
                    console.error("SearchAPI Error:", e);
                }
            }
        }

        // 3. Start AI Request with Context
        let aiResult: string | null = null;
        try {
            console.log("Calling internal AI route with context...");
            const aiRes = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, context: searchContext })
            });

            if (aiRes.ok) {
                const aiData = await aiRes.json();
                aiResult = aiData.content;
            } else {
                const errText = await aiRes.text();
                console.error(`Internal AI Route failed: ${aiRes.status}`, errText);
            }
        } catch (e) {
            console.error("Internal AI Error:", e);
        }

        // 3a. Handle Image Generation Tag (Synapse V4.0 Multimodal) (Robust Check)
        let generatedStats: { url: string; description: string } | null = null;
        if (aiResult) {
            console.log("[SYNAPSE] Checking for Image Generation Tags...");

            // Regex to capture [[GENERATE_IMAGE: ... ]] with any whitespace
            const tagRegex = /\[\[GENERATE_IMAGE:\s*([\s\S]*?)\]\]/i;
            const match = aiResult.match(tagRegex);

            if (match && match[1]) {
                const imgPrompt = match[1].trim();
                console.log(`[MULTIMODAL] 🎨 Detecting Image Gen Request: "${imgPrompt}"`);

                try {
                    const { generateImage } = await import('./image-generation');
                    const genImg = await generateImage(imgPrompt);

                    if (genImg) {
                        console.log(`[MULTIMODAL] ✅ Image Generated: ${genImg.url}`);
                        aiResult = aiResult.replace(
                            tagRegex,
                            `\n\n![Generated Visual](${genImg.url})  \n> *Neural Generation Complete: ${imgPrompt.substring(0, 50)}...*`
                        );
                        generatedStats = { url: genImg.url, description: genImg.description };
                    } else {
                        console.warn("[MULTIMODAL] Image Generation returned null (Fallback failed?)");
                        aiResult = aiResult.replace(tagRegex, `> [System: Visual Generation Signal Weak - Retrying...]`);
                    }
                } catch (err) {
                    console.error("[MULTIMODAL] 💥 Critical Logic Error:", err);
                }
            } else {
                console.log("[MULTIMODAL] No Image Tag pattern matched.");
            }
        }

        // 4. Transform Results or Fallback to AI-Only
        // We always return AI result if available, even if search data is missing
        if (aiResult || (googleData && googleData.items)) {
            let aiSummary = aiResult
                ? aiResult
                : `Neural Analysis Complete. Decrypting ${googleData?.items?.length || 'multiple'} web nodes related to "${query}". Data stream suggests high relevance in the current technical landscape.`;

            if (aiResult) console.log("Internal AI Success (Context-Aware)");

            const searchResults = googleData?.items?.map((item: any, i: number) => ({
                id: `g${i}`,
                title: item.title,
                url: item.link,
                snippet: item.snippet,
                source: new URL(item.link || 'http://web.node').hostname.split('.')[0].toUpperCase(),
                image: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.metatags?.[0]?.['og:image']
            })) || [];

            const searchImages: { url: string; description: string }[] = googleData?.items
                ?.filter((item: any) => item.pagemap?.cse_image?.[0]?.src)
                .map((item: any) => ({
                    url: item.pagemap.cse_image[0].src,
                    description: item.title
                })) || [];

            const images = generatedStats ? [generatedStats, ...searchImages] : searchImages;

            const links = googleData?.items?.map((item: any) => ({
                title: item.title,
                url: item.link,
                description: item.snippet
            })) || [];

            return {
                query,
                aiResponse: aiSummary,
                results: searchResults,
                images: images,
                links: links
            };
        }

        // Final Fallback: Pure AI Knowledge (Seamless)
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            query,
            aiResponse: `Neural Analysis for "${query}" complete. \n\nBased on internal knowledge bases: \n\n${query} is a significant topic in the current domain. Please verify network connectivity for real-time web verification.`,
            images: [],
            links: [],
            results: []
        };
    }
}

export const synapseAI = new SynapseAIService();
