export interface FeedSource {
  id: string;
  name: string;
  url: string;
  category: string;
  icon?: string;
}

export interface Article {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  author?: string;
  thumbnail?: string;
  feedSourceId: string;
  feedSourceName: string;
  category: string;
  read?: boolean;
}

export interface AppState {
  excludedKeywords: string[];
  readArticleIds: Set<string>;
  starredArticleIds: Set<string>;
  activeFeedId: string | 'all' | 'unread';
  searchQuery: string;
}

export const FEED_CATEGORIES = [
  'Business',
  'Local',
  'Major News',
  'Podcasts',
  'Science',
  'Sports',
  'Technology'
];

export const DEFAULT_FEEDS: FeedSource[] = [
  // Major News
  { id: 'bbc', name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml', category: 'Major News' },
  { id: 'cnn', name: 'CNN', url: 'http://rss.cnn.com/rss/cnn_topstories.rss', category: 'Major News' },
  { id: 'reuters', name: 'Reuters', url: 'https://news.google.com/rss/search?q=when:24h+source:Reuters&hl=en-US&gl=US&ceid=US:en', category: 'Major News' },
  { id: 'ap', name: 'Associated Press', url: 'https://news.google.com/rss/search?q=when:24h+source:Associated_Press', category: 'Major News' },
  { id: 'nyt', name: 'NY Times', url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', category: 'Major News' },
  { id: 'wapo', name: 'Washington Post', url: 'http://feeds.washingtonpost.com/rss/national', category: 'Major News' },
  { id: 'wsj', name: 'Wall Street Journal', url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', category: 'Major News' },
  { id: 'guardian', name: 'The Guardian', url: 'https://www.theguardian.com/world/rss', category: 'Major News' },
  { id: 'npr', name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml', category: 'Major News' },
  { id: 'nbc', name: 'NBC News', url: 'https://feeds.nbcnews.com/nbcnews/public/news', category: 'Major News' },
  { id: 'time', name: 'Time', url: 'https://time.com/feed/', category: 'Major News' },
  { id: 'yahoo', name: 'Yahoo News', url: 'https://news.yahoo.com/rss/news', category: 'Major News' },
  { id: 'latimes', name: 'LA Times', url: 'https://www.latimes.com/world/rss2.0.xml', category: 'Major News' },
  { id: 'abc', name: 'ABC News', url: 'https://feeds.abcnews.com/abcnews/topstories', category: 'Major News' },
  { id: 'vice', name: 'VICE', url: 'https://www.vice.com/en/rss', category: 'Major News' },
  { id: 'cbs', name: 'CBS News', url: 'https://www.cbsnews.com/latest/rss/main', category: 'Major News' },
  { id: 'google-news', name: 'Google News', url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', category: 'Major News' },
  { id: 'news4max', name: 'News4Max', url: 'https://news4max.com/feed/', category: 'Major News' },

  // Local
  { id: 'google-local', name: 'Google Local', url: 'https://news.google.com/rss/topics/CAAqHAgKIhZDQklTQ2pvSWJHOWpZV3hmZGpJb0FBUAE/sections/CAQiTkNCSVNORG9JYkc5allXeGZkakpDRUd4dlkyRnNYM1l5WDNObFkzUnBiMjV5Q2hJSUwyMHZNRFl3ZDNGNkNnb0lMMjB2TURZd2QzRW9BQSowCAAqLAgKIiZDQklTRmpvSWJHOWpZV3hmZGpKNkNnb0lMMjB2TURZd2QzRW9BQVABUAE?hl=en-US&gl=US&ceid=US%3Aen', category: 'Local' },
  { id: 'colorado-springs', name: 'Colorado Springs', url: 'https://www.koaa.com/news.rss', category: 'Local' },
  { id: 'koaa', name: 'KOAA', url: 'https://www.koaa.com/news/covering-colorado.rss', category: 'Local' },
  { id: 'krdo', name: 'KRDO', url: 'https://krdo.com/category/news/pueblo/feed/', category: 'Local' },
  { id: 'fox31', name: 'FOX31 Denver', url: 'https://kdvr.com/feed/', category: 'Local' },
  { id: 'colorado-sun', name: 'Colorado Sun', url: 'https://coloradosun.com/feed/', category: 'Local' },
  { id: 'denver-gazette', name: 'Denver Gazette', url: 'https://rss.xcancel.com/search/rss?f=tweets&q=DenverGazette', category: 'Local' },

  // Sports
  { id: 'google-sports', name: 'Google Sports', url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en', category: 'Sports' },
  { id: 'espn', name: 'ESPN', url: 'https://www.espn.com/espn/rss/news', category: 'Sports' },
  { id: 'nfl', name: 'NFL', url: 'https://www.nfl.com/rss/rsslanding?searchString=home', category: 'Sports' },
  { id: 'nba', name: 'NBA', url: 'https://www.nba.com/rss/nba_rss.xml', category: 'Sports' },
  { id: 'yahoo-sports', name: 'Yahoo Sports', url: 'https://news.yahoo.com/rss/sports', category: 'Sports' },
  { id: 'cbs-sports', name: 'CBS Sports', url: 'https://www.cbssports.com/rss/headlines/', category: 'Sports' },
  { id: 'fox-sports', name: 'FOX Sports', url: 'https://api.foxsports.com/v1/rss?partnerKey=zBaFxRyGKCfxBagJG9b8pqLyndmvo7UU', category: 'Sports' },

  // Science
  { id: 'google-science', name: 'Google Science', url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en', category: 'Science' },
  { id: 'yahoo-science', name: 'Yahoo Science', url: 'https://news.yahoo.com/rss/science', category: 'Science' },
  { id: 'science-daily', name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/top/science.xml', category: 'Science' },
  { id: 'scientific-american', name: 'Scientific American', url: 'https://www.scientificamerican.com/section/generic-rss/', category: 'Science' },
  { id: 'npr-science', name: 'NPR Science', url: 'https://feeds.npr.org/1007/rss.xml', category: 'Science' },
  { id: 'ars-technica', name: 'ARS Technica', url: 'https://arstechnica.com/science/feed/', category: 'Science' },

  // Technology
  { id: 'google-tech', name: 'Google Technology', url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en', category: 'Technology' },
  { id: 'reuters-tech', name: 'Reuters Technology', url: 'https://www.reutersagency.com/feed/?best-topics=technology&post_type=best', category: 'Technology' },
  { id: 'cnn-tech', name: 'CNN Technology', url: 'http://rss.cnn.com/rss/cnn_tech.rss', category: 'Technology' },
  { id: 'wapo-tech', name: 'Washington Post Tech', url: 'https://feeds.washingtonpost.com/rss/business/technology', category: 'Technology' },
  { id: 'yahoo-tech', name: 'Yahoo Tech', url: 'https://news.yahoo.com/rss/tech', category: 'Technology' },
  { id: 'the-verge', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Technology' },
  { id: 'wired', name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'Technology' },
  { id: 'bloomberg-tech', name: 'Bloomberg Tech', url: 'https://www.bloomberg.com/feeds/technology/sitemap.xml', category: 'Technology' },
  { id: 'forbes-business', name: 'Forbes Business', url: 'https://www.forbes.com/business/feed/', category: 'Technology' },
  { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Technology' },
  { id: 'nytimes-tech', name: 'NYT Tech', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', category: 'Technology' },
  { id: 'lifehacker', name: 'LifeHacker', url: 'https://lifehacker.com/rss', category: 'Technology' },
  { id: 'cnet', name: 'CNET', url: 'https://www.cnet.com/rss/news/', category: 'Technology' },
  { id: 'gizmodo', name: 'Gizmodo', url: 'https://gizmodo.com/rss', category: 'Technology' },
  { id: 'cbs-tech', name: 'CBS Tech', url: 'https://www.cbsnews.com/latest/rss/technology', category: 'Technology' },
  { id: 'science-daily-tech', name: 'Science Daily Tech', url: 'https://www.sciencedaily.com/rss/top/technology.xml', category: 'Technology' },

  // Business
  { id: 'google-business', name: 'Google Business', url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en', category: 'Business' },
  { id: 'reuters-business', name: 'Reuters Business', url: 'https://www.reutersagency.com/feed/?best-topics=business&post_type=best', category: 'Business' },
  { id: 'wapo-business', name: 'Washington Post Business', url: 'http://feeds.washingtonpost.com/rss/business', category: 'Business' },
  { id: 'yahoo-business', name: 'Yahoo Business', url: 'https://news.yahoo.com/rss/business', category: 'Business' },
  { id: 'yahoo-finance', name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex', category: 'Business' },
  { id: 'atlantic', name: 'The Atlantic Business', url: 'https://www.theatlantic.com/feed/all/', category: 'Business' },
  { id: 'hbr', name: 'Harvard Business Review', url: 'https://feeds.hbr.org/harvardbusiness', category: 'Business' },
  { id: 'fortune', name: 'Fortune', url: 'https://fortune.com/feed/', category: 'Business' },
  { id: 'business-insider', name: 'Business Insider', url: 'https://www.businessinsider.com/rss', category: 'Business' },
  { id: 'economist', name: 'Economist', url: 'https://www.economist.com/business/rss.xml', category: 'Business' },
  { id: 'cnn-business', name: 'CNN Business', url: 'http://rss.cnn.com/rss/money_latest.rss', category: 'Business' },
  { id: 'dow-jones', name: 'Dow Jones', url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', category: 'Business' },
  { id: 'wsj-business', name: 'WSJ Business', url: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml', category: 'Business' },
  { id: 'cbs-money', name: 'CBS MoneyWatch', url: 'https://www.cbsnews.com/latest/rss/moneywatch', category: 'Business' },

  // Podcasts
  { id: 'this-american-life', name: 'This American Life', url: 'https://www.thisamericanlife.org/podcast/rss.xml', category: 'Podcasts' },
  { id: 'dateline', name: 'Dateline', url: 'https://podcastfeeds.nbcnews.com/dateline-nbc', category: 'Podcasts' },
  { id: 'crimejunkie', name: 'Crimejunkie', url: 'https://feeds.simplecast.com/qm_9xx0g', category: 'Podcasts' },
];
