import axios from 'axios';

export async function fetchFredSeriesLatest(apiKey: string, series: string) {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=2`;
  const { data } = await axios.get(url, { timeout: 10000 });
  const obs = data?.observations || [];
  if (obs.length === 0) throw new Error('No FRED observations');
  const today = Number(obs[0].value);
  const prev = obs[1] ? Number(obs[1].value) : today;
  const deltaBpsDay = Math.round((today - prev) * 100); // percent → bps
  return { asOf: obs[0].date, annualRatePct: today, deltaBpsDay };
}
