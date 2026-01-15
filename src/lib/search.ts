
/**
 * Professional Web Search using Google Custom Search API
 */

const GOOGLE_SEARCH_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY;
const GOOGLE_SEARCH_CX = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CX;

export async function performWebSearch(query: string): Promise<string> {
    try {
        console.log(`[WebSearch] Using Google Custom Search | Query: ${query}`);

        if (!GOOGLE_SEARCH_API_KEY || !GOOGLE_SEARCH_CX) {
            return "Google Search API configuration missing. Please check NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY and NEXT_PUBLIC_GOOGLE_SEARCH_CX in your .env file.";
        }

        const url = new URL("https://www.googleapis.com/customsearch/v1");
        url.searchParams.set('key', GOOGLE_SEARCH_API_KEY);
        url.searchParams.set('cx', GOOGLE_SEARCH_CX);
        url.searchParams.set('q', query);

        const response = await fetch(url.toString());

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Google Search API returned status ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // Build formatted response
        let resultText = "";

        // Organic Results
        if (data.items && data.items.length > 0) {
            resultText += "### Search Results\n";
            for (const item of data.items.slice(0, 5)) {
                resultText += `**[${item.title}](${item.link})**\n`;
                resultText += `${item.snippet}\n\n`;
            }
        }

        if (!resultText) {
            return "No results found for this query.";
        }

        return resultText.trim();

    } catch (error) {
        console.error("Google Search Error:", error);
        return `Search error: ${(error as Error).message}`;
    }
}
