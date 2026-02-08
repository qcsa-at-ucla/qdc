'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NewsItem {
  title: string;
  summary: string;
  source: string;
  date: string;
  url?: string;
  category: string;
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  Research: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  Industry: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  Hardware: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  Software: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  Policy: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  Education: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
};

const categoryIcons: Record<string, JSX.Element> = {
  Research: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  Industry: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Hardware: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  Software: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  Policy: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  Education: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
};

function NewsCardSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-6 w-20 bg-white/10 rounded-full"></div>
        <div className="h-4 w-24 bg-white/10 rounded"></div>
      </div>
      <div className="h-6 w-3/4 bg-white/10 rounded mb-3"></div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-white/10 rounded"></div>
        <div className="h-4 w-5/6 bg-white/10 rounded"></div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className="h-4 w-16 bg-white/10 rounded"></div>
      </div>
    </div>
  );
}

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const colors = categoryColors[item.category] || categoryColors.Research;
  const icon = categoryIcons[item.category] || categoryIcons.Research;

  const formatDate = (dateStr: string) => {
    try {
      // Parse as local date to avoid timezone shift issues
      // Input format: YYYY-MM-DD
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
        const day = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      // Fallback for other formats
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/[0.07] group"
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>
          {icon}
          {item.category}
        </span>
        {/* <span className="text-gray-500 text-sm">{formatDate(item.date)}</span> */}
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
        {item.title}
      </h3>
      
      <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
        {item.summary}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          {item.source}
        </span>
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(`${item.title} ${item.source} quantum computing`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1 transition-colors"
        >
          Find article
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </a>
      </div>
    </motion.div>
  );
}

export default function QuantumNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/quantum-news');
        
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        
        const data = await response.json();
        setNews(data.news || []);
        setLastFetched(data.fetchedAt);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Unable to load quantum news at this time.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatLastFetched = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-indigo-400 text-sm font-medium">Live Updates</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Quantum Computing News
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Stay informed with the latest breakthroughs, research, and developments in quantum computing
          </p>
          
          {lastFetched && (
            <p className="text-sm text-gray-500 mt-4">
              Last updated: {formatLastFetched(lastFetched)}
            </p>
          )}
        </motion.div>

        {error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={i} />)
              : news.map((item, index) => (
                  <NewsCard key={index} item={item} index={index} />
                ))}
          </div>
        )}

        {!loading && !error && news.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-500 text-sm">
              News aggregated using AI • Updated hourly
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
