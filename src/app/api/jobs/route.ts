import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CACHE_MAX_AGE_HOURS = 6;

interface JobItem {
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  link: string;
}

interface CachedJobsResult {
  jobs_data: JobItem[];
  fetched_at: string;
}

async function getCachedJobs(supabaseUrl: string, supabaseKey: string) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/get_cached_jobs`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return null;

    const data: CachedJobsResult[] = await res.json();
    if (data.length === 0) return null;

    return { jobs: data[0].jobs_data, fetchedAt: data[0].fetched_at };
  } catch (err) {
    console.error('Failed to get cached jobs:', err);
    return null;
  }
}

async function cacheJobs(supabaseUrl: string, supabaseKey: string, jobs: JobItem[]) {
  try {
    await fetch(`${supabaseUrl}/rest/v1/rpc/cache_jobs`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobs_data: jobs }),
    });
  } catch (err) {
    console.error('Failed to save jobs to cache:', err);
  }
}

async function fetchQuantumJobs(): Promise<JobItem[]> {
  try {
    const openaiKey = process.env.OPENAI_API_KEY!;
    const prompt = `
Find 7 brand new current job opportunities in quantum computing, hardware, or related research. Do not keep regenerating the same stuff.
Focus on:
- Quantum device engineering
- Superconducting qubits
- Quantum photonics
- Quantum research and internships
Return ONLY valid JSON array with objects:

[
  {
    "title": "",
    "company": "",
    "location": "",
    "type": "",
    "description": "",
    "link": ""
  }
]

Ensure all links are real job postings (URLs that work). Do not include any extra text or markdown.
`;

    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // faster model (~7s)
        tools: [{ type: 'web_search_preview' }],
        input: prompt,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('OpenAI error:', text);
      return [];
    }

    const data = await res.json();

    const message = data.output?.find((item: any) => item.type === 'message');
    const textBlock = message?.content?.find((c: any) => c.type === 'output_text');
    const text = textBlock?.text;

    if (!text) return [];

    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const jobs: JobItem[] = JSON.parse(cleaned);

    return jobs;
  } catch (err) {
    console.error('Failed to fetch quantum jobs:', err);
    return [];
  }
}


export async function GET(req: NextRequest) {
  try {
    const regenerate = req.nextUrl.searchParams.get('regenerate') === 'true';
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

    if (!regenerate) {
      const cached = await getCachedJobs(supabaseUrl, supabaseKey);
      if (cached) {
        const age = Date.now() - new Date(cached.fetchedAt).getTime();
        if (age < CACHE_MAX_AGE_HOURS * 60 * 60 * 1000) {
          return NextResponse.json({ jobs: cached.jobs, cached: true });
        }
      }
    }

    const jobs = await fetchQuantumJobs();

    if (!regenerate && jobs.length > 0) {
      cacheJobs(supabaseUrl, supabaseKey, jobs);
    }

    return NextResponse.json({ jobs, cached: false });
  } catch (err) {
    console.error('Quantum jobs API error:', err);
    return NextResponse.json({ jobs: [], error: 'Failed to fetch jobs' }, { status: 500 });
  }
}