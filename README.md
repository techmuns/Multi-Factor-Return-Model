# Multi-Factor Return Model

A factor-portfolio dashboard for Indian equities. Combine CAPM, Fama-French, and
Carhart factors — Market, Size, Value, Momentum, Profitability, and Investment —
and find the weighting that would have produced the best historical risk-adjusted
return.

Monthly factor return data (Oct 2003–2026) is sourced from the
[SCDLDS Factor Library](https://quantfin-scdlds.com), Ashoka University.

## Features

- **Factor Library** — standalone historical performance of each of the six factors.
- **Portfolio Builder** — pick any combination of factors, weight them equally,
  manually, or let the app solve for the historical max-Sharpe (tangency) weights.
- **Best Portfolios** — every non-empty combination of the six factors (63 total)
  is evaluated with optimized weights and ranked by Sharpe ratio; the top 5 overall
  are surfaced regardless of how many factors each one uses.
- **Compare** — overlay up to 5 saved portfolios on one growth chart with a
  side-by-side stats table (return, volatility, Sharpe, drawdown, upside/downside
  capture).

## Methodology notes

- The market factor is converted to an excess return (`MKT − Rf`) so all six
  factors are on the same "zero-investment excess return" footing before being
  combined.
- Optimized weights are the closed-form max-Sharpe (tangency) solution
  `w ∝ Σ⁻¹μ` computed from historical monthly means/covariances, L1-normalized so
  gross exposure sums to 100% (negative weights mean shorting that factor).
- All metrics are computed in-sample over the common date range where every
  factor has data (Oct 2003 onward).

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # typecheck + production build
```

Factor data lives in `public/data/ff5_factors_monthly.csv`.
