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

        // Start Internal AI Request immediately (Parallel)
        const aiRequestPromise = (async () => {
            try {
                console.log("Calling internal AI route (Parallel)...");
                const aiRes = await fetch("/api/ai", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query })
                });
                if (aiRes.ok) {
                    const aiData = await aiRes.json();
                    return aiData.content;
                } else {
                    const errText = await aiRes.text();
                    console.error(`Internal AI Route failed: ${aiRes.status}`, errText);
                    return null;
                }
            } catch (e) {
                console.error("Internal AI Error:", e);
                return null;
            }
        })();

        // Start Google Search Request (Parallel)
        const googleSearchPromise = (async () => {
            if (apiKey && cx) {
                try {
                    const response = await fetch(
                        `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`
                    );
                    const data = await response.json();
                    return data;
                } catch (error) {
                    console.error("Google Search API Error:", error);
                    return null;
                }
            }
            return null;
        })();

        // Await both results
        const [aiResult, googleData] = await Promise.all([aiRequestPromise, googleSearchPromise]);

        if (googleData && googleData.items) {
            let aiSummary = aiResult
                ? aiResult
                : `Neural Analysis Complete. Decrypting ${googleData.searchInformation?.totalResults || 'multiple'} web nodes related to "${query}". Data stream suggests high relevance in the current technical landscape.`;

            if (aiResult) console.log("Internal AI Success:", aiResult.substring(0, 50));

            return {
                query,
                aiResponse: aiSummary,
                results: googleData.items.map((item: any, i: number) => ({
                    id: `g${i}`,
                    title: item.title,
                    url: item.link,
                    snippet: item.snippet,
                    source: new URL(item.link).hostname.split('.')[0].toUpperCase(),
                    image: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.metatags?.[0]?.['og:image']
                })),
                images: googleData.items
                    .filter((item: any) => item.pagemap?.cse_image?.[0]?.src)
                    .map((item: any) => ({
                        url: item.pagemap.cse_image[0].src,
                        description: item.title
                    })),
                links: googleData.items.map((item: any) => ({
                    title: item.title,
                    url: item.link,
                    description: item.snippet
                }))
            };
        }

        // Fallback to Mock Data if API fails or keys aren't set
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            query,
            aiResponse: `[MOCK MODE] Neural analysis for "${query}" reveals a convergence of AI and decentralized architectures. (Add GOOGLE_SEARCH_API_KEY to .env for real results)`,
            images: [
                { url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600", description: `Advanced neural visualization of ${query} architecture.` },
                { url: "https://images.unsplash.com/photo-1676299081847-824916ef030a?auto=format&fit=crop&q=80&w=600", description: `Real-time data processing nodes identified for ${query}.` }
            ],
            links: [
                {
                    title: `Official ${query} Documentation`,
                    url: `https://${query.toLowerCase().replace(/ /g, '-')}.org/docs`,
                    description: `The authoritative source for ${query} specifications and implementation guidelines.`
                }
            ],
            results: [
                {
                    id: 'r1',
                    title: `Comprehensive Guide to ${query}`,
                    url: `https://intel.synapse.ai/nodes/${query.toLowerCase().replace(/ /g, '-')}`,
                    snippet: `Explore the deep architecture of ${query} and how it integrates with modern AI frameworks.`,
                    source: "Neural Intel",
                    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400"
                }
            ]
        };
    }
}

export const synapseAI = new SynapseAIService();
