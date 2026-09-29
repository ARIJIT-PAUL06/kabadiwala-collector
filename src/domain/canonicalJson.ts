// Serves: R08
/**
 * Deterministic Canonical JSON Stringifier.
 * - Sorts object keys recursively in lexicographical order.
 * - Omits keys with undefined values.
 * - Emits no whitespace around separators (compact).
 * - Preserves array element ordering while canonicalizing each element.
 */
export function canonicalJson(val: unknown): string {
  if (val === null || typeof val !== 'object') {
    return JSON.stringify(val);
  }

  if (Array.isArray(val)) {
    const items = val.map((item) => {
      const canonical = canonicalJson(item);
      return canonical === undefined ? 'null' : canonical;
    });
    return `[${items.join(',')}]`;
  }

  const record = val as Record<string, unknown>;
  const sortedKeys = Object.keys(record).sort();
  const entries: string[] = [];

  for (const key of sortedKeys) {
    const value = record[key];
    if (value !== undefined) {
      const canonicalValue = canonicalJson(value);
      if (canonicalValue !== undefined) {
        entries.push(`${JSON.stringify(key)}:${canonicalValue}`);
      }
    }
  }

  return `{${entries.join(',')}}`;
}
