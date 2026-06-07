"use client";

import { NewsArticle } from "@/lib/types";
import { ExternalLink, Clock, Loader2, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState, useCallback } from "react";

export default function NewsTab({ symbol }: { symbol: string }) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news?symbol=${encodeURIComponent(symbol)}`);
      const data = await res.json();
      if (data.error && !data.articles?.length) throw new Error(data.error);
      setNews(data.articles ?? []);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch news';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <div className="w-1 h-5 bg-primary rounded-full"></div>
          Latest News &amp; Filings
        </h3>
        <button
          onClick={fetchNews}
          className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
          title="Refresh news"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && !news.length && (
        <div className="flex items-center justify-center min-h-[200px] gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading news…</span>
        </div>
      )}

      {error && (
        <div className="glass-panel p-6 flex flex-col items-center justify-center min-h-[200px] text-center gap-3">
          <p className="text-destructive font-medium">Failed to load news</p>
          <p className="text-xs text-muted-foreground">{error}</p>
          <button onClick={fetchNews} className="text-primary text-sm hover:underline">Try again</button>
        </div>
      )}

      {!loading && !error && news.length === 0 && (
        <div className="glass-panel p-6 flex flex-col items-center justify-center min-h-[200px] text-center gap-2 text-muted-foreground">
          <p>No recent news found for {symbol.split('.')[0]}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {news.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card p-5 group cursor-pointer block"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-medium text-primary px-2 py-0.5 bg-primary/10 rounded">
                    {item.source}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
                  </span>
                </div>
                <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-2 leading-snug">
                  {item.title}
                </h4>
                {item.summary && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.summary}
                  </p>
                )}
              </div>

              {/* Thumbnail or icon */}
              <div className="hidden sm:flex w-24 h-24 bg-secondary/50 rounded-lg flex-shrink-0 items-center justify-center border border-border overflow-hidden">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <ExternalLink className="w-6 h-6 text-muted-foreground opacity-50 group-hover:text-primary transition-colors" />
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
