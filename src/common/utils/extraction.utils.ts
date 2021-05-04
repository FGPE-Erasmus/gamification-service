export function extractToJson(entry: Buffer): any {
  return JSON.parse(entry.toString('utf8'));
}
