/**
 * Reads a CSV or XLSX file into Record<string,string>[] keyed by the header row.
 * XLSX support is dynamically imported to keep the bundle small.
 */
export async function parseFile(file: File): Promise<Record<string, string>[]> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return [];
    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
      raw: false,
    });
    return rows.map((row) => {
      const normalized: Record<string, string> = {};
      for (const [k, v] of Object.entries(row)) {
        normalized[k.trim().toLowerCase()] = String(v ?? "").trim();
      }
      return normalized;
    });
  }
  const text = await file.text();
  return parseCsv(text);
}

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
