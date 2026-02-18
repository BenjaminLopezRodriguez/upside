type CsvValue = string | number | boolean | null | undefined

function escapeCsvCell(value: CsvValue): string {
  if (value == null) return ""
  const s = String(value)
  // Quote if it contains commas, quotes, or newlines.
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function toCsv(rows: Record<string, CsvValue>[]): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0] ?? {})
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((r) => headers.map((h) => escapeCsvCell(r[h])).join(",")),
  ]
  return lines.join("\n")
}

export function downloadCsv(filename: string, rows: Record<string, CsvValue>[]) {
  const csv = toCsv(rows)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`
  a.click()

  URL.revokeObjectURL(url)
}

