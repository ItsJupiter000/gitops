import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  try {
    const result = await yf.search(q, { quotesCount: 10, newsCount: 0 });

    const stocks = (result.quotes ?? [])
      .filter((item) => item.quoteType === 'EQUITY' || item.quoteType === 'ETF')
      .map((item) => ({
        symbol: item.symbol,
        name: (item as { longname?: string; shortname?: string }).longname ?? (item as { longname?: string; shortname?: string }).shortname ?? item.symbol,
        exchange: (item as { exchange?: string }).exchange ?? '',
        sector: (item as { sector?: string }).sector ?? undefined,
      }));

    return NextResponse.json({ results: stocks });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Search failed';
    console.error('[/api/search] Error:', message);
    return NextResponse.json({ results: [], error: message });
  }
}
