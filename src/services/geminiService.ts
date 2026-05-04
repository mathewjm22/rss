import { CORS_PROXY } from '../constants';

export interface RelatedArticle {
  title: string;
  source: string;
  url: string;
  snippet: string;
}

export async function findRelatedCoverage(articleTitle: string): Promise<RelatedArticle[]> {
  try {
    // Attempt local API first
    try {
      const response = await fetch(`/api/search-news?q=${encodeURIComponent(articleTitle)}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.log("Local search API not found, falling back to client-side CORS search.");
    }

    // Fallback for static hosting (GitHub Pages)
    // Use Google News RSS Search via central proxy
    const searchUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(articleTitle)}+when:7d&hl=en-US&gl=US&ceid=US:en`;
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(searchUrl)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error(`Proxy error! status: ${response.status}`);
    
    const xmlString = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, "text/xml");
    const itemElements = xml.querySelectorAll("item");
    
    const items = Array.from(itemElements).slice(0, 5).map(item => {
      const getTag = (tag: string) => item.querySelector(tag)?.textContent || "";
      const sourceElement = item.getElementsByTagName("source")[0];
      
      return {
        title: getTag("title"),
        source: sourceElement?.textContent || "News Source",
        url: getTag("link"),
        snippet: getTag("description").replace(/<[^>]*>?/gm, '').substring(0, 200)
      };
    });
    
    return items;
  } catch (error) {
    console.error("Error finding related coverage:", error);
    return [];
  }
}
