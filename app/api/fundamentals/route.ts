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
    const data = await yf.quoteSummary(symbol, {
      modules: ['summaryDetail', 'financialData', 'defaultKeyStatistics', 'assetProfile'],
    });

    const detail = data.summaryDetail;
    const financial = data.financialData;
    const keyStats = data.defaultKeyStatistics;
    const profile = data.assetProfile;

    const result = {
      symbol,
      marketCap: detail?.marketCap ?? keyStats?.enterpriseValue,
      peRatio: detail?.trailingPE,
      forwardPE: detail?.forwardPE,
      pbRatio: keyStats?.priceToBook,
      eps: keyStats?.trailingEps,
      roe: financial?.returnOnEquity != null ? financial.returnOnEquity * 100 : undefined,
      dividendYield: detail?.dividendYield != null ? detail.dividendYield * 100 : undefined,
      week52High: detail?.fiftyTwoWeekHigh,
      week52Low: detail?.fiftyTwoWeekLow,
      revenue: financial?.totalRevenue,
      netIncome: financial?.netIncomeToCommon,
      totalDebt: financial?.totalDebt,
      freeCashFlow: financial?.freeCashflow,
      debtToEquity: financial?.debtToEquity,
      currentRatio: financial?.currentRatio,
      revenueGrowth: financial?.revenueGrowth != null ? financial.revenueGrowth * 100 : undefined,
      netMargin: financial?.profitMargins != null ? financial.profitMargins * 100 : undefined,
      beta: keyStats?.beta,
      sector: (profile as { sector?: string } | undefined)?.sector,
      industry: (profile as { industry?: string } | undefined)?.industry,
      description: (profile as { longBusinessSummary?: string } | undefined)?.longBusinessSummary,
      employees: (profile as { fullTimeEmployees?: number } | undefined)?.fullTimeEmployees,
      country: (profile as { country?: string } | undefined)?.country,
      website: (profile as { website?: string } | undefined)?.website,
    };

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=600' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch fundamentals';
    console.error(`[/api/fundamentals] Error for ${symbol}:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
