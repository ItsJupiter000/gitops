import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    const searchResult = await yf.search(symbol, { newsCount: 15, quotesCount: 0 });

    const articles = (searchResult.news ?? []).map((item, idx: number) => ({
      id: String(idx),
      title: item.title,
      summary: undefined,
      source: item.publisher,
      url: item.link,
      publishedAt: new Date((item.providerPublishTime as number) * 1000).toISOString(),
      image: (item as { thumbnail?: { resolutions?: { url: string }[] } }).thumbnail?.resolutions?.[0]?.url,
    }));

    return NextResponse.json({ symbol, articles }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch news';
    console.error(`[/api/news] Error for ${symbol}:`, message);
    return NextResponse.json({ error: message, articles: [] }, { status: 200 });
  }
}
