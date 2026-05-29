import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const YT_KEY = process.env.YOUTUBE_API_KEY;
  if (!YT_KEY) {
    return NextResponse.json({ videos: [], disabled: true });
  }

  const q = req.nextUrl.searchParams.get('q');
  if (!q) return NextResponse.json({ error: 'q parameter required' }, { status: 400 });

  const query = encodeURIComponent(`${q} travel guide`);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=3&key=${YT_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json({ error: 'YouTube API request failed', videos: [] });
  }

  const data = await res.json();
  const videos = (data.items ?? []).map((item: {
    id: { videoId: string };
    snippet: { title: string; description: string; thumbnails: { medium: { url: string } } };
  }) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails?.medium?.url ?? '',
  }));

  return NextResponse.json({ videos });
}
