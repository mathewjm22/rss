import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import Parser from 'rss-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const parser = new Parser({
    customFields: {
      item: [
        ['media:content', 'mediaContent', { keepArray: true }],
        ['media:thumbnail', 'mediaThumbnail'],
        ['content:encoded', 'contentEncoded'],
        ['enclosure', 'enclosure'],
        ['source', 'source'],
      ],
    },
  });

  // API Proxy for RSS Feeds
  app.get('/api/rss', async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      console.log(`[Proxy] Fetching: ${url}`);
      const feed = await parser.parseURL(url);
      res.json(feed);
    } catch (error) {
      console.error(`[Proxy] Error fetching ${url}:`, error);
      res.status(500).json({ error: 'Failed to fetch RSS feed', details: String(error) });
    }
  });

  // Free Search API for Related Coverage (No API Key Required)
  app.get('/api/search-news', async (req, res) => {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    try {
      // Use Google News RSS Search which is free and requires no API key
      const searchUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}+when:7d&hl=en-US&gl=US&ceid=US:en`;
      const feed = await parser.parseURL(searchUrl);
      
      const results = (feed.items || []).slice(0, 5).map(item => ({
        title: item.title || '',
        source: (item as any).source || 'News Source',
        url: item.link || '',
        snippet: item.contentSnippet || item.content || ''
      }));

      res.json(results);
    } catch (error) {
      console.error(`[Search] Error searching for ${q}:`, error);
      res.status(500).json({ error: 'Failed to find related coverage' });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aura Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
