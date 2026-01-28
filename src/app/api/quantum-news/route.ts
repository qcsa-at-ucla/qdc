import { NextRequest, NextResponse } from 'next/server';

/**
 * Quantum News API - Uses OpenAI Responses API with web search to fetch latest quantum computing news
 * 
 * Required environment variables:
 *   - OPENAI_API_KEY
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_KEY
 * 
 * Rate Limiting (via Supabase):
 *   - 50 requests per IP per 24 hours (configurable via QUANTUM_NEWS_RATE_LIMIT env var)
 */

// Rate limiting configuration
const RATE_LIMIT_PER_IP = parseInt(process.env.QUANTUM_NEWS_RATE_LIMIT || '50', 10);
const RATE_LIMIT_WINDOW_HOURS = 24;

interface RateLimitResult {
  allowed: boolean;
  current_count: number;
  remaining: number;
  reset_at: string;
}

interface CachedNewsResult {
  news_data: NewsItem[];
  fetched_at: string;
}

async function getCachedNews(
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ news: NewsItem[]; fetchedAt: string } | null> {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_cached_news`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to get cached news:', await response.text());
      return null;
    }

    const results: CachedNewsResult[] = await response.json();
    if (results.length > 0) {
      return {
        news: results[0].news_data,
        fetchedAt: results[0].fetched_at,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting cached news:', error);
    return null;
  }
}

async function saveNewsToCache(
  news: NewsItem[],
  supabaseUrl: string,
  supabaseKey: string
): Promise<void> {
  try {
    await fetch(`${supabaseUrl}/rest/v1/rpc/save_news_cache`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_news_data: news }),
    });
  } catch (error) {
    console.error('Error saving news to cache:', error);
  }
}

async function checkRateLimitWithSupabase(
  ip: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  try {
    // Call the Supabase function to check/update rate limit
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/check_rate_limit`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_ip_address: ip,
        p_endpoint: '/api/quantum-news',
        p_max_requests: RATE_LIMIT_PER_IP,
        p_window_hours: RATE_LIMIT_WINDOW_HOURS,
      }),
    });

    if (!response.ok) {
      console.error('Supabase rate limit check failed:', await response.text());
      // If rate limiting fails, allow the request but log the error
      return { allowed: true, remaining: RATE_LIMIT_PER_IP, resetAt: Date.now() + 86400000 };
    }

    const results: RateLimitResult[] = await response.json();
    const result = results[0];
    
    return {
      allowed: result.allowed,
      remaining: result.remaining,
      resetAt: new Date(result.reset_at).getTime(),
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // If rate limiting fails, allow the request but log the error
    return { allowed: true, remaining: RATE_LIMIT_PER_IP, resetAt: Date.now() + 86400000 };
  }
}

function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP (handles proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback (may not work in all environments)
  return 'unknown';
}

interface NewsItem {
  title: string;
  summary: string;
  source: string;
  date: string;
  url?: string;
  category: string;
}

interface OpenAIOutputText {
  type: 'output_text';
  text: string;
}

interface OpenAIResponseItem {
  type: string;
  content?: OpenAIOutputText[];
}

interface OpenAIResponsesAPIResponse {
  output: OpenAIResponseItem[];
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    // Rate limiting check (only if Supabase is configured)
    const clientIP = getClientIP(request);
    let rateLimit = { allowed: true, remaining: RATE_LIMIT_PER_IP, resetAt: Date.now() + 86400000 };
    
    if (supabaseUrl && supabaseKey) {
      rateLimit = await checkRateLimitWithSupabase(clientIP, supabaseUrl, supabaseKey);
      
      if (!rateLimit.allowed) {
        // Rate limited - return cached news instead of error
        const cachedNews = await getCachedNews(supabaseUrl, supabaseKey);
        
        if (cachedNews) {
          return NextResponse.json(
            { 
              news: cachedNews.news, 
              fetchedAt: cachedNews.fetchedAt,
              cached: true 
            },
            {
              headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
                'X-RateLimit-Limit': RATE_LIMIT_PER_IP.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': rateLimit.resetAt.toString(),
                'X-News-Source': 'cache',
              },
            }
          );
        }
        
        // No cached news available, return rate limit error
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': RATE_LIMIT_PER_IP.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimit.resetAt.toString(),
              'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
            }
          }
        );
      }
    }

    const openaiKey = process.env.OPENAI_API_KEY;

    if (!openaiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const currentDate = new Date().toISOString().split('T')[0];

    const prompt = `Search the web for the 6 most recent and significant quantum computing news articles and developments from the past week (as of ${currentDate}).

For each news item, provide:
1. The exact title from the article
2. A brief 2-3 sentence summary
3. The source/publication name
4. The publication date (format: YYYY-MM-DD)
5. The URL to the article
6. A category (one of: "Research", "Industry", "Hardware", "Software", "Policy", "Education")

Focus on:
- Major breakthroughs in quantum computing research
- New quantum hardware announcements
- Quantum software and algorithm developments
- Industry partnerships and investments
- Government policies and initiatives

Return ONLY a valid JSON array with objects containing: title, summary, source, date, url, category
Example format:
[
  {
    "title": "Example Quantum Breakthrough",
    "summary": "Brief description of the news item.",
    "source": "Nature",
    "date": "2026-01-25",
    "url": "https://example.com/article",
    "category": "Research"
  }
]

IMPORTANT: Return ONLY the JSON array, no other text or markdown formatting.`;

    // Use OpenAI Responses API with web search tool
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        tools: [{ type: 'web_search_preview' }],
        input: prompt,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch news from OpenAI' },
        { status: 500 }
      );
    }

    const data: OpenAIResponsesAPIResponse = await response.json();
    
    // Extract the text content from the response
    const messageOutput = data.output?.find((item: OpenAIResponseItem) => item.type === 'message');
    const textContent = messageOutput?.content?.find((c: OpenAIOutputText) => c.type === 'output_text');
    const content = textContent?.text;

    if (!content) {
      console.error('No content in response:', JSON.stringify(data));
      return NextResponse.json(
        { error: 'No content received from OpenAI' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let newsItems: NewsItem[];
    try {
      // Clean up the response in case it has markdown code blocks
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      newsItems = JSON.parse(cleanedContent);
    } catch {
      console.error('Failed to parse OpenAI response:', content);
      return NextResponse.json(
        { error: 'Failed to parse news data' },
        { status: 500 }
      );
    }

    // Save news to cache in Supabase (non-blocking)
    if (supabaseUrl && supabaseKey) {
      saveNewsToCache(newsItems, supabaseUrl, supabaseKey);
    }

    // Return the news items with cache headers (cache for 1 hour) and rate limit info
    return NextResponse.json(
      { news: newsItems, fetchedAt: new Date().toISOString(), cached: false },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          'X-RateLimit-Limit': RATE_LIMIT_PER_IP.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetAt.toString(),
          'X-News-Source': 'live',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching quantum news:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
