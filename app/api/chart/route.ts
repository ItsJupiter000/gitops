import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const period = searchParams.get('period') || '3M';

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  // Map our frontend periods to Yahoo Finance params
  const periodMap: Record<string, { period1: string; interval: '1d' | '1wk' | '1mo' | '1h' | '5m' }> = {
    '1D': { period1: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], interval: '5m' },
    '5D': { period1: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], interval: '1h' },
    '1M': { period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], interval: '1d' },
    '3M': { period1: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], interval: '1d' },
    '1Y': { period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], interval: '1d' },
    '5Y': { period1: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], interval: '1wk' },
  };

  const params = periodMap[period] || periodMap['3M'];

  try {
    const result = await yf.chart(symbol, {
      period1: params.period1,
      interval: params.interval,
    });

    const quotes = (result.quotes ?? [])
      .filter((q) => q.open != null && q.high != null && q.low != null && q.close != null)
      .map((q) => ({
        time: Math.floor(new Date(q.date).getTime() / 1000),
        open: q.open!,
        high: q.high!,
        low: q.low!,
        close: q.close!,
        volume: q.volume ?? 0,
      }));

    return NextResponse.json({ symbol, quotes }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch chart data';
    console.error(`[/api/chart] Error for ${symbol}:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
