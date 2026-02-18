/**
 * Parse CSV string into rows of record (header -> values).
 * Handles quoted fields and commas inside quotes.
 */
export function parseCsv(csvText: string): Record<string, string>[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]!);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]!);
    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      row[h] = values[j] ?? "";
    });
    rows.push(row);
  }

  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/** Normalize header for flexible matching (e.g. "Transaction Date" -> "date") */
const COLUMN_ALIASES: Record<string, string> = {
  date: "date",
  "transaction date": "date",
  "trans date": "date",
  amount: "amount",
  "amount (usd)": "amount",
  "amount (cents)": "amount",
  merchant: "merchant",
  description: "merchant",
  "merchant name": "merchant",
  "merchant name/description": "merchant",
  category: "category",
  memo: "memo",
  notes: "memo",
};

export function normalizeCsvRow(
  row: Record<string, string>,
): { date: string; amount: string; merchant: string; category: string; memo: string } {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    const k = key.toLowerCase().trim();
    const alias = COLUMN_ALIASES[k] ?? k.replace(/\s+/g, "_");
    normalized[alias] = value?.trim() ?? "";
  }
  return {
    date: normalized["date"] ?? "",
    amount: normalized["amount"] ?? "",
    merchant: normalized["merchant"] ?? "",
    category: normalized["category"] ?? "Uncategorized",
    memo: normalized["memo"] ?? "",
  };
}

/** Parse amount string to cents. Accepts "12.99" (dollars) or "1299" (cents). */
export function parseAmountToCents(value: string): number {
  const cleaned = value.replace(/[$,]/g, "").trim();
  if (!cleaned) return 0;
  const num = Number.parseFloat(cleaned);
  if (Number.isNaN(num)) return 0;
  // If it looks like dollars (has decimal or small number), convert to cents
  if (cleaned.includes(".") || (num > 0 && num < 100000 && !Number.isInteger(Number(cleaned)))) {
    return Math.round(num * 100);
  }
  return Math.round(num);
}

/** Parse date string to Date (YYYY-MM-DD or MM/DD/YYYY). */
export function parseCsvDate(value: string): Date | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  // ISO-style
  const iso = /^\d{4}-\d{2}-\d{2}/.exec(trimmed);
  if (iso) {
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  // US-style MM/DD/YYYY or MM-DD-YYYY
  const us = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/.exec(trimmed);
  if (us) {
    const [, month, day, year] = us;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}
