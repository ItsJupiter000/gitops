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
    const quote = await yf.quote(symbol);

    const result = {
      symbol: quote.symbol,
      price: quote.regularMarketPrice ?? 0,
      change: quote.regularMarketChange ?? 0,
      changePercent: quote.regularMarketChangePercent ?? 0,
      high: quote.regularMarketDayHigh ?? 0,
      low: quote.regularMarketDayLow ?? 0,
      open: quote.regularMarketOpen ?? 0,
      prevClose: quote.regularMarketPreviousClose ?? 0,
      volume: quote.regularMarketVolume ?? 0,
      marketCap: quote.marketCap ?? undefined,
      timestamp: Date.now(),
      currency: quote.currency ?? 'USD',
      shortName: quote.shortName ?? symbol,
      longName: quote.longName ?? undefined,
      exchange: quote.fullExchangeName ?? undefined,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh ?? undefined,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow ?? undefined,
    };

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch quote';
    console.error(`[/api/quote] Error for ${symbol}:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
