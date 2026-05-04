import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Newspaper, 
  Search, 
  Settings, 
  ChevronRight, 
  Clock, 
  Filter, 
  CheckCheck, 
  Trash2, 
  Menu,
  X,
  Share2,
  ExternalLink,
  Ghost
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Article, FeedSource, DEFAULT_FEEDS, FEED_CATEGORIES } from './types';
import { fetchRSS } from './lib/rssService';
import { cn } from './lib/utils';
import { findRelatedCoverage, RelatedArticle } from './services/geminiService';

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('Major News');
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Major News']));
  const [searchQuery, setSearchQuery] = useState('');
  const [excludedKeywords, setExcludedKeywords] = useState<string[]>(() => {
    const saved = localStorage.getItem('excluded_keywords');
    return saved ? JSON.parse(saved) : [];
  });
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('read_article_ids');
    return new Set(saved ? JSON.parse(saved) : []);
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Persist state
  useEffect(() => {
    localStorage.setItem('excluded_keywords', JSON.stringify(excludedKeywords));
  }, [excludedKeywords]);

  useEffect(() => {
    localStorage.setItem('read_article_ids', JSON.stringify(Array.from(readIds)));
  }, [readIds]);

  // Load articles
  useEffect(() => {
    const loadFeeds = async () => {
      setLoading(true);
      let sourcesToFetch: FeedSource[] = [];
      
      if (activeSourceId) {
        const source = DEFAULT_FEEDS.find(f => f.id === activeSourceId);
        if (source) sourcesToFetch = [source];
      } else {
        sourcesToFetch = DEFAULT_FEEDS.filter(f => f.category === activeTab);
      }

      const results = await Promise.all(sourcesToFetch.map(fetchRSS));
      const flattened = results.flat().sort((a, b) => 
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );
      setArticles(flattened);
      setLoading(false);
      setLastUpdated(new Date());
    };
    loadFeeds();
  }, [activeTab, activeSourceId, refreshKey]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
    setActiveTab(cat);
    setActiveSourceId(null);
  };

  const selectSource = (sourceId: string, cat: string) => {
    setActiveSourceId(sourceId);
    setActiveTab(cat);
  };

  // Filtering Logic
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      // Keyword exclusion
      if (excludedKeywords.some(keyword => 
        article.title.toLowerCase().includes(keyword.toLowerCase()) || 
        article.contentSnippet.toLowerCase().includes(keyword.toLowerCase())
      )) return false;

      // Search query
      if (searchQuery && !article.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [articles, excludedKeywords, searchQuery]);

  const markAsRead = (id: string) => {
    setReadIds(prev => new Set([...Array.from(prev), id]));
  };

  const removeKeyword = (word: string) => {
    setExcludedKeywords(prev => prev.filter(w => w !== word));
  };

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyword && !excludedKeywords.includes(newKeyword)) {
      setExcludedKeywords([...excludedKeywords, newKeyword]);
      setNewKeyword('');
    }
  };

  const handleArticleSelect = (article: Article) => {
    setSelectedArticle(article);
    setRelatedArticles([]); // Reset related coverage when changing articles
    markAsRead(article.id);
  };

  const handleFindRelated = async () => {
    if (!selectedArticle) return;
    setLoadingRelated(true);
    setRelatedArticles([]);
    try {
      const results = await findRelatedCoverage(selectedArticle.title);
      setRelatedArticles(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingRelated(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-40">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">A</div>
            <span className="font-bold text-lg tracking-tight hidden sm:block uppercase">Aura News</span>
          </div>
          
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search in articles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 lg:w-80 bg-slate-100 border-none rounded-full py-1.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex gap-3 items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Excluding:</span>
            <div className="flex gap-1.5">
              {excludedKeywords.slice(0, 3).map(word => (
                <span 
                  key={word}
                  className="bg-red-50 text-red-700 text-[11px] px-2.5 py-1 rounded border border-red-100 flex items-center gap-1.5 font-semibold group transition-colors hover:bg-red-100 cursor-pointer"
                  onClick={() => removeKeyword(word)}
                >
                  {word} <X size={10} className="opacity-40 group-hover:opacity-100" />
                </span>
              ))}
              {excludedKeywords.length > 3 && (
                <span className="text-[11px] text-slate-400 font-bold px-2">+{excludedKeywords.length - 3} more</span>
              )}
              {excludedKeywords.length === 0 && (
                <span className="text-[11px] text-slate-300 italic">None</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
            >
              <Settings size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 text-[10px] font-extrabold uppercase">
              MN
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Feeds */}
        <motion.aside 
          initial={false}
          animate={{ width: isSidebarOpen ? 240 : 0, opacity: isSidebarOpen ? 1 : 0 }}
          className="bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden relative"
        >
          <div className="flex-1 overflow-y-auto scrollbar-hide py-6 px-4 space-y-8">
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Knowledge Base</h3>
              <ul className="space-y-1">
                  {FEED_CATEGORIES.map(cat => {
                    const isExpanded = expandedCategories.has(cat);
                    const sources = DEFAULT_FEEDS
                      .filter(f => f.category === cat)
                      .sort((a, b) => a.name.localeCompare(b.name));
                    
                    return (
                    <li key={cat} className="space-y-1">
                      <div 
                        onClick={() => toggleCategory(cat)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 group",
                          activeTab === cat && !activeSourceId
                            ? "bg-indigo-50 text-indigo-700 font-semibold" 
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full transition-colors",
                            activeTab === cat ? "bg-indigo-600" : "bg-transparent group-hover:bg-slate-300"
                          )} />
                          <span className="text-sm">{cat}</span>
                        </div>
                        <ChevronRight 
                          size={14} 
                          className={cn(
                            "transition-transform duration-200",
                            isExpanded ? "rotate-90" : "opacity-40"
                          )} 
                        />
                      </div>

                      {isExpanded && (
                        <motion.ul 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          className="pl-7 pr-2 space-y-0.5 overflow-hidden"
                        >
                          {sources.map(source => {
                            const domain = new URL(source.url).hostname;
                            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
                            
                            return (
                              <li 
                                key={source.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectSource(source.id, cat);
                                }}
                                className={cn(
                                  "text-[13px] py-1.5 px-3 rounded-md cursor-pointer transition-colors flex items-center gap-2",
                                  activeSourceId === source.id 
                                    ? "text-indigo-600 font-bold bg-indigo-50/50" 
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                              >
                                <img src={faviconUrl} alt="" className="w-3.5 h-3.5 rounded-sm shrink-0" />
                                <span className="truncate">{source.name}</span>
                              </li>
                            );
                          })}
                        </motion.ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Resources</h3>
              <ul className="space-y-4 px-2">
                <li className="flex flex-col gap-1">
                  <p className="text-[11px] text-slate-500 font-medium tracking-tight">Sync Status</p>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide">
                    <span className="text-green-600">All feeds live</span>
                    <span className="text-slate-300">
                      {lastUpdated.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })} {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </motion.aside>

        {/* Middle Column: News Feed */}
        <section className="w-full sm:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <span className="text-sm font-bold tracking-tight">
              {activeSourceId 
                ? DEFAULT_FEEDS.find(f => f.id === activeSourceId)?.name 
                : activeTab}
            </span>
            <button 
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="text-indigo-600 text-[11px] font-bold uppercase tracking-wider hover:text-indigo-700 transition-colors"
            >
              Refresh
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide bg-slate-50 space-y-0.5">
            {loading ? (
               <div className="flex flex-col items-center justify-center h-full p-8 space-y-3 opacity-30">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
               </div>
            ) : filteredArticles.length === 0 ? (
               <div className="p-12 text-center space-y-3">
                  <Filter className="mx-auto text-slate-200" size={40} strokeWidth={1} />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No articles found</p>
               </div>
            ) : (
              filteredArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleArticleSelect(article)}
                  className={cn(
                    "bg-white p-4 transition-all duration-200 cursor-pointer border-l-4 group relative",
                    selectedArticle?.id === article.id 
                      ? "border-indigo-600 shadow-sm z-10" 
                      : "border-transparent hover:bg-slate-50 hover:border-slate-100",
                    readIds.has(article.id) && "opacity-50"
                  )}
                >
                  <div className="flex gap-4">
                    {article.thumbnail && (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded shrink-0 overflow-hidden border border-slate-100">
                         <img src={article.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        {(() => {
                          const source = DEFAULT_FEEDS.find(f => f.id === article.feedSourceId);
                          if (!source) return null;
                          const domain = new URL(source.url).hostname;
                          return <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} alt="" className="w-3 h-3 rounded-sm opacity-80" />;
                        })()}
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{article.feedSourceName}</span>
                        <span className="text-slate-300 text-[10px]">•</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{formatDistanceToNow(new Date(article.pubDate))} ago</span>
                      </div>
                      <h4 className={cn(
                        "text-sm font-bold leading-snug line-clamp-2 transition-colors",
                        selectedArticle?.id === article.id ? "text-indigo-900" : "text-slate-800"
                      )}>
                        {article.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed italic">
                        {article.contentSnippet}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right Column: Article View */}
        <article className="flex-1 bg-white overflow-hidden flex flex-col relative">
          <AnimatePresence mode="wait">
            {!selectedArticle ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-6 font-serif text-5xl italic border border-slate-100 shadow-sm">
                  A
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Welcome to your workspace</h3>
                <p className="text-sm text-slate-400 max-w-xs leading-relaxed">Select a headline from the side to begin review in professional focus mode.</p>
              </motion.div>
            ) : (
              <motion.div 
                key={selectedArticle.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 overflow-y-auto scrollbar-hide"
              >
                <div className="p-8 lg:p-14 max-w-2xl mx-auto">
                  <div className="mb-10">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="bg-indigo-600 text-white text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-widest shadow-sm">
                        {selectedArticle.feedSourceName}
                      </span>
                      <span className="text-slate-400 text-xs font-medium">
                        {new Date(selectedArticle.pubDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    
                    <h1 className="text-3xl lg:text-5xl font-bold text-slate-900 leading-[1.1] mb-8 font-serif italic border-l-8 border-indigo-600 pl-6">
                      {selectedArticle.title}
                    </h1>

                    <div className="flex items-center gap-4 border-y border-slate-100 py-5">
                      {(() => {
                        const source = DEFAULT_FEEDS.find(f => f.id === selectedArticle.feedSourceId);
                        const domain = source ? new URL(source.url).hostname : '';
                        return (
                          <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
                            {domain ? (
                              <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt="" className="w-6 h-6 object-contain" />
                            ) : (
                              <span className="font-bold text-slate-500 uppercase text-xs">{selectedArticle.feedSourceName.charAt(0)}</span>
                            )}
                          </div>
                        );
                      })()}
                      <div>
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">Source Authority</p>
                        <p className="text-xs text-slate-400">Authenticated via {new URL(selectedArticle.link).hostname}</p>
                      </div>
                      <div className="ml-auto flex gap-3">
                        <button className="p-2.5 hover:bg-indigo-50 rounded-full text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100">
                          <Share2 size={18} />
                        </button>
                        <button className="p-2.5 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200">
                          <ExternalLink size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {selectedArticle.thumbnail && (
                    <div className="w-full aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-indigo-100/50 border border-slate-100">
                      <img 
                        src={selectedArticle.thumbnail} 
                        alt="" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div className="article-content" dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />

                  {/* Related Coverage Section */}
                  <div className="mt-16 pt-10 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Related Coverage</h3>
                        <p className="text-sm text-slate-500 mt-1">Sourced via Global News Search</p>
                      </div>
                      <button 
                        onClick={handleFindRelated}
                        disabled={loadingRelated}
                        className={cn(
                          "px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2",
                          loadingRelated 
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 active:scale-95"
                        )}
                      >
                        {loadingRelated ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search size={16} />
                            Find related news
                          </>
                        )}
                      </button>
                    </div>

                    {relatedArticles.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {relatedArticles.map((rel, idx) => (
                          <motion.a
                            key={idx}
                            href={rel.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-5 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100 group transition-all duration-300 block"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                {rel.source}
                              </span>
                              <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                              {rel.title}
                            </h4>
                            <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                              {rel.snippet}
                            </p>
                          </motion.a>
                        ))}
                      </div>
                    ) : !loadingRelated && (
                      <div className="py-12 flex flex-col items-center justify-center text-center px-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4 text-slate-400">
                          <Search size={20} />
                        </div>
                        <p className="text-sm font-medium text-slate-600">Want to see how other sources are reporting this?</p>
                        <p className="text-xs text-slate-400 mt-1">Compare coverage from around the world in one click.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-16 pt-10 border-t border-slate-100 flex items-center justify-between">
                     <a 
                      href={selectedArticle.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-5 py-2.5 rounded-full hover:bg-indigo-100 transition-all"
                    >
                      Read full article on {selectedArticle.feedSourceName}
                      <span className="text-xs">↗</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </article>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
            onClick={() => setIsSettingsOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-2">Workspace Preferences</h2>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Configuration v1.0.4</p>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-900 uppercase tracking-widest">Keyword Filters</label>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">AUTO-CLEANSE ACTIVE</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-6 font-medium">Define strings to automatically scrub from your headlines and digests.</p>
                  
                  <form onSubmit={handleAddKeyword} className="flex gap-3 mb-6">
                    <input 
                      type="text" 
                      placeholder="Add exclusion keyword..."
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      className="flex-1 px-5 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none font-medium placeholder:text-slate-300"
                    />
                    <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                      Sync
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2.5">
                    {excludedKeywords.length === 0 ? (
                      <div className="w-full py-12 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-200">
                        <Ghost size={40} strokeWidth={1} />
                        <p className="text-[10px] font-extrabold uppercase tracking-widest mt-4">Zero active exclusion filters</p>
                      </div>
                    ) : (
                      excludedKeywords.map(word => (
                        <div key={word} className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 text-slate-700 rounded-xl border border-slate-100 group hover:border-red-200 hover:bg-red-50 transition-all">
                          <span className="text-sm font-bold tracking-tight">{word}</span>
                          <button 
                            onClick={() => removeKeyword(word)}
                            className="text-slate-300 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <div className="flex gap-4">
                    <button className="flex-1 py-4 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                      Export Archive
                    </button>
                    <button 
                      onClick={() => { setReadIds(new Set()); setIsSettingsOpen(false); }}
                      className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-2xl hover:bg-slate-50 transition-all"
                    >
                      Reset Reader Cache
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
