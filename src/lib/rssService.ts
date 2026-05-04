import { Article, FeedSource } from '../types';
import { CORS_PROXY } from '../constants';

/**
 * Native DOMParser based RSS parser for client-side fallback
 * This avoids Node-only dependencies that cause 'removeAllListeners' errors.
 */
function parseRSSOnClient(xmlString: string, source: FeedSource): any {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, "text/xml");
  const items: any[] = [];

  const elements = xml.querySelectorAll("item");
  elements.forEach(item => {
    const getTag = (tag: string) => item.querySelector(tag)?.textContent || "";
    
    // Support media namespaces
    const getMediaUrl = () => {
      const mediaThumbnail = item.getElementsByTagName("media:thumbnail")[0];
      if (mediaThumbnail) return mediaThumbnail.getAttribute("url");
      
      const mediaContent = item.getElementsByTagName("media:content")[0];
      if (mediaContent) return mediaContent.getAttribute("url");
      
      const enclosure = item.querySelector("enclosure");
      if (enclosure && enclosure.getAttribute("type")?.startsWith("image/")) {
        return enclosure.getAttribute("url");
      }
      
      return null;
    };

    items.push({
      title: getTag("title"),
      link: getTag("link"),
      pubDate: getTag("pubDate") || getTag("dc:date"),
      content: getTag("content:encoded") || getTag("description"),
      contentSnippet: getTag("description").replace(/<[^>]*>?/gm, '').substring(0, 200),
      creator: getTag("dc:creator") || getTag("author"),
      guid: getTag("guid"),
      thumbnail: getMediaUrl()
    });
  });

  return { items };
}

export async function fetchRSS(source: FeedSource): Promise<Article[]> {
  try {
    let feed;
    
    // Attempt to use local API first (works in Dev and Full-stack hosting)
    try {
      const response = await fetch(`/api/rss?url=${encodeURIComponent(source.url)}`);
      if (response.ok) {
        feed = await response.json();
      }
    } catch (e) {
      console.log("Local API not found, falling back to CORS proxy for static hosting.");
    }

    // Fallback: If local API failed or we are on static hosting (like GitHub Pages)
    if (!feed) {
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(source.url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`Proxy error! status: ${response.status}`);
      const xmlString = await response.text();
      feed = parseRSSOnClient(xmlString, source);
    }
    
    if (!feed || !feed.items) return [];

    return feed.items.map((item: any) => {
      // Content extraction
      const content = item.content || '';
      const snippet = item.contentSnippet || content.replace(/<[^>]*>?/gm, '').substring(0, 200) || '';

      let thumbnail = item.thumbnail || '';
      
      // Fallback: extract from content if no media tags found
      if (!thumbnail) {
        const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) thumbnail = imgMatch[1];
      }

      return {
        id: item.guid || item.link || Math.random().toString(36).substr(2, 9),
        title: item.title || 'Untitled',
        link: item.link || '',
        pubDate: item.pubDate || new Date().toISOString(),
        content: content,
        contentSnippet: snippet,
        author: item.creator || '',
        thumbnail,
        feedSourceId: source.id,
        feedSourceName: source.name,
        category: source.category,
      };
    });
  } catch (error) {
    console.error(`Error fetching ${source.name}:`, error);
    return [];
  }
}
