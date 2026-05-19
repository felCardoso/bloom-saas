/**
 * Minimal RFC 4180-compliant CSV parser.
 * Returns an array of objects keyed by the header row (first row).
 */
export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const nonEmpty = lines.filter((l) => l.trim() !== "");
  if (nonEmpty.length < 2) return [];

  const headers = splitRow(nonEmpty[0]).map((h) => h.trim().toLowerCase());

  return nonEmpty.slice(1).map((line) => {
    const values = splitRow(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (values[i] ?? "").trim();
    });
    return obj;
  });
}

function splitRow(row: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

/** Maps flexible header aliases to canonical field names */
export function normalizeHeaders(
  row: Record<string, string>,
  aliases: Record<string, string[]>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [canonical, keys] of Object.entries(aliases)) {
    for (const k of keys) {
      if (row[k] !== undefined) {
        result[canonical] = row[k];
        break;
      }
    }
    if (result[canonical] === undefined) result[canonical] = "";
  }
  return result;
}
