import { NextResponse } from 'next/server';

const WIKI = 'https://en.wikipedia.org/w/api.php';
const UA   = 'WeatherScope/1.0 (weather app; educational)';

async function imageByTitle(title: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      action: 'query', titles: title,
      prop: 'pageimages', format: 'json',
      pithumbsize: '1200', origin: '*',
    });
    const res = await fetch(`${WIKI}?${params}`, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = Object.values(data.query?.pages ?? {}) as Record<string, unknown>[];
    const page = pages[0] as { pageid?: number; thumbnail?: { source?: string } } | undefined;
    if (!page || page.pageid === -1) return null;
    return page.thumbnail?.source ?? null;
  } catch { return null; }
}

async function imageBySearch(query: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      action: 'query', list: 'search',
      srsearch: query, srlimit: '5',
      format: 'json', origin: '*',
    });
    const res = await fetch(`${WIKI}?${params}`, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    const data = await res.json();
    const results: { title: string }[] = data.query?.search ?? [];
    for (const r of results.slice(0, 3)) {
      const img = await imageByTitle(r.title);
      if (img) return img;
    }
    return null;
  } catch { return null; }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const location = (searchParams.get('location') ?? '').trim();
  const country  = (searchParams.get('country')  ?? '').trim();

  if (!location) return NextResponse.json({ url: null });

  // 1. Try exact location name
  let url = await imageByTitle(location);
  if (url) return NextResponse.json({ url });

  // 2. Try "City, Country" — helps disambiguate small towns
  if (country) {
    url = await imageByTitle(`${location}, ${country}`);
    if (url) return NextResponse.json({ url });
  }

  // 3. Search Wikipedia (catches alternate spellings / districts)
  url = await imageBySearch(country ? `${location} ${country}` : location);
  if (url) return NextResponse.json({ url });

  // 4. Country-level fallback
  if (country) {
    url = await imageByTitle(country);
    if (url) return NextResponse.json({ url });
  }

  return NextResponse.json({ url: null });
}
