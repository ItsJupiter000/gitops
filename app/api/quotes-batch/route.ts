import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbolsParam = searchParams.get('symbols');

  if (!symbolsParam) {
    return NextResponse.json({ error: 'symbols query param is required' }, { status: 400 });
  }

  const symbols = symbolsParam.split(',').map((s) => s.trim()).filter(Boolean);

  try {
    const results: Record<string, object> = {};

    await Promise.allSettled(
      symbols.map(async (symbol) => {
        try {
          const quote = await yf.quote(symbol);
          results[symbol] = {
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
          };
        } catch (e) {
          console.error(`[/api/quotes-batch] Error for ${symbol}:`, e);
          results[symbol] = { error: 'fetch failed' };
        }
      })
    );

    return NextResponse.json(results, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Batch fetch failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
