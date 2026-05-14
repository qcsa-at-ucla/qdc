import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// How often to run a new AI scrape (hours). Between scrapes, persisted jobs are served.
const SCRAPE_INTERVAL_HOURS = 6;

// Supabase client with fetch caching disabled (Next.js patches fetch to cache by default)
function createUncachedClient(url: string, key: string) {
  return createClient(url, key, {
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  });
}

interface JobItem {
  title: string;
  company: string;
  location: string;
  type: string;
  category: 'academic' | 'government' | 'industry';
  description: string;
  link: string;
  pinned?: boolean;
}

/** Returns all persisted scraped jobs from the DB */
async function getPersistedJobs(supabaseUrl: string, supabaseKey: string): Promise<JobItem[]> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/get_scraped_jobs`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map((row: any) => ({
      title: row.title,
      company: row.company,
      location: row.location,
      type: row.type,
      category: row.category as JobItem['category'],
      description: row.description,
      link: row.link,
    }));
  } catch (err) {
    console.error('Failed to get persisted jobs:', err);
    return [];
  }
}

/** Upserts scraped jobs into the DB by link (deduplicates; updates last_seen_at) */
async function persistScrapedJobs(supabaseUrl: string, supabaseKey: string, jobs: JobItem[]) {
  try {
    await fetch(`${supabaseUrl}/rest/v1/rpc/upsert_scraped_jobs`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobs_data: jobs }),
    });
    // Log the scrape run
    await fetch(`${supabaseUrl}/rest/v1/rpc/log_scrape_run`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ job_count: jobs.length }),
    });
  } catch (err) {
    console.error('Failed to persist scraped jobs:', err);
  }
}

/** Returns the timestamp of the last successful scrape, or null */
async function getLastScrapeTime(supabaseUrl: string, supabaseKey: string): Promise<Date | null> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/get_last_scrape_time`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;
    return new Date(data[0].scraped_at);
  } catch (err) {
    console.error('Failed to get last scrape time:', err);
    return null;
  }
}

async function fetchQuantumJobs(): Promise<JobItem[]> {
  try {
    const openaiKey = process.env.OPENAI_API_KEY!;
    const prompt = `
Find 15 brand new current job opportunities across the full spectrum of quantum technology. Do not keep regenerating the same stuff. Search broadly.

Search across ALL of these sectors:
- ACADEMIC: University research positions, postdocs, PhD studentships, lab manager roles, research scientist positions at universities or research institutes
- GOVERNMENT: National labs (e.g. NIST, Sandia, Oak Ridge, LBNL, ORNL, Fermilab), defense/intelligence agencies, government-funded research programs, DOE/DOD/DARPA-related quantum roles
- INDUSTRY: Private companies (startups and large corporations), quantum computing companies (IBM, Google, IonQ, Rigetti, PsiQuantum, Quantinuum, etc.), semiconductor/photonics firms, consulting, quantum software companies

Cover a wide range of roles including:
- Quantum hardware engineering (superconducting, trapped ion, photonic, neutral atom, spin qubits)
- Quantum software and algorithms
- Quantum error correction
- Cryogenic engineering
- Quantum networking and communications
- Quantum sensing and metrology
- Materials science for quantum devices
- Quantum simulation
- Control systems and electronics
- Quantum research internships and fellowships

For each job, classify it into exactly one category based ONLY on the EMPLOYER (not the job title):
- "government": The employer is a national laboratory (Argonne, Sandia, Los Alamos, Oak Ridge, LBNL, ORNL, Fermilab, NIST, JPL, Lincoln Lab, APL, PNNL, INL), a defense/intelligence agency, a government agency, or a government contractor whose primary business is government/defense work
- "academic": The employer is a university or university-affiliated research institute (MIT, Stanford, Harvard, Caltech, UC Berkeley, Oxford, etc.)
- "industry": The employer is a private company, startup, or corporation — this includes IBM, Google, Microsoft, Amazon, IonQ, Rigetti, PsiQuantum, Quantinuum, Quantum Circuits, Intel, etc. Even if the role is "Research Intern" or "Research Scientist", if the employer is a private company, it is INDUSTRY.

IMPORTANT: Categorize by WHO the employer is, not what the job title sounds like. A "Research Intern" at Microsoft is INDUSTRY. A "Research Scientist" at Argonne is GOVERNMENT.

Return ONLY valid JSON array with objects:

[
  {
    "title": "",
    "company": "",
    "location": "",
    "type": "",
    "category": "academic" | "government" | "industry",
    "description": "",
    "link": ""
  }
]

Aim for roughly 5 jobs per category (academic, government, industry). Ensure all links are real job postings (URLs that work). Do not include any extra text or markdown.
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


async function getManualJobs(supabaseUrl: string, supabaseKey: string): Promise<JobItem[]> {
  try {
    const supabase = createUncachedClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('manual_job_listings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch manual jobs:', error);
      return [];
    }

    return (data || []).map((row) => ({
      title: row.title,
      company: row.company,
      location: row.location,
      type: row.type,
      category: row.category || 'industry' as const,
      description: row.description,
      link: row.link,
      pinned: true,
    }));
  } catch (err) {
    console.error('Failed to fetch manual jobs:', err);
    return [];
  }
}

const NO_CACHE_HEADERS = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };

export async function GET(req: NextRequest) {
  try {
    const regenerate = req.nextUrl.searchParams.get("regen") === "true";
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

    // Always fetch active manual/pinned jobs
    const manualJobs = await getManualJobs(supabaseUrl, supabaseKey);

    // Check if a fresh scrape is needed
    let shouldScrape = regenerate;
    if (!shouldScrape) {
      const lastScrape = await getLastScrapeTime(supabaseUrl, supabaseKey);
      if (!lastScrape) {
        shouldScrape = true; // Never scraped before
      } else {
        const ageMs = Date.now() - lastScrape.getTime();
        shouldScrape = ageMs > SCRAPE_INTERVAL_HOURS * 60 * 60 * 1000;
      }
    }

    if (shouldScrape) {
      // Run the AI scrape; fire-and-forget the persist so response isn't delayed
      const aiJobs = await fetchQuantumJobs();
      if (aiJobs.length > 0) {
        // Persist in background — don't await so the response is fast
        persistScrapedJobs(supabaseUrl, supabaseKey, aiJobs).catch(() => {});
      }
    }

    // Always serve ALL persisted scraped jobs (accumulates over time, never blank)
    const scrapedJobs = await getPersistedJobs(supabaseUrl, supabaseKey);

    return NextResponse.json(
      { jobs: [...manualJobs, ...scrapedJobs], cached: !shouldScrape },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error('Quantum jobs API error:', err);
    return NextResponse.json({ jobs: [], error: 'Failed to fetch jobs' }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
