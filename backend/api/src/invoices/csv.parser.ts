import { parse } from 'fast-csv';
import { Readable } from 'stream';

export type RawRow = {
  vendor: string; 
  invoice_number: string; 
  amount: string;
  invoice_date: string; 
  due_date: string; 
  terms: string; 
  currency?: string;
  user_rate?: string;
  rate_type?: string;
};

export async function parseCsv(buffer: Buffer): Promise<RawRow[]> {
  const rows: RawRow[] = [];
  await new Promise<void>((resolve, reject) => {
    Readable.from(buffer)
      .pipe(parse<RawRow, RawRow>({ headers: true, ignoreEmpty: true, trim: true }))
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve())
      .on('error', reject);
  });
  return rows;
}
