/**
 * CORS PROXY CONFIGURATION
 * 
 * If you are hosting on GitHub Pages, the browser will block direct 
 * requests to news sources (BBC, Reuters, etc.) due to CORS.
 * 
 * You can use a public proxy like AllOrigins (default below) or 
 * set up your own Cloudflare Worker for better reliability.
 * 
 * To use a Cloudflare Worker, set this to:
 * export const CORS_PROXY = "https://your-worker-name.your-subdomain.workers.dev/?url=";
 */
export const CORS_PROXY = "https://api.allorigins.win/raw?url=";
