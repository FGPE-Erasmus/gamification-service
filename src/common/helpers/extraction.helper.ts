export class ExtractionHelper {
  extractToJson(entry: Buffer): any {
    const entryString = entry.toString('utf8');
    const entryJson = JSON.parse(entryString);
    return entryJson;
  }
}
