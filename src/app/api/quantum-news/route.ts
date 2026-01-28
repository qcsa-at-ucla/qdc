import { NextResponse } from 'next/server';

/**
 * Quantum News API - Uses OpenAI Responses API with web search to fetch latest quantum computing news
 * 
 * Required environment variables:
 *   - OPENAI_API_KEY
 */

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

export async function GET() {
  try {
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

    // Return the news items with cache headers (cache for 1 hour)
    return NextResponse.json(
      { news: newsItems, fetchedAt: new Date().toISOString() },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
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
