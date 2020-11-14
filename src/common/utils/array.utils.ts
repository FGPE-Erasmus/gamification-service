export function arrayToObject(array: any[], key: string): { [key: string]: any } {
  return array.reduce((acc, curr) => {
    acc[curr[key]] = curr;
    return acc;
  }, {});
}

export function parseArray(s: string): string[] {
  return s ? s.split(/[,;]\s+?/).filter(sx => !!sx) : [];
}

export function groupBy<T, K extends keyof any>(list: T[], getKey: (item: T) => K): Record<K, T[]> {
  return list.reduce((previous, currentItem) => {
    const group = getKey(currentItem);
    if (!previous[group]) previous[group] = [];
    previous[group].push(currentItem);
    return previous;
  }, {} as Record<K, T[]>);
}

export function flatten<T>(input: any[], output: T[] = []): Array<T> {
  for (const value of input) {
    Array.isArray(value) ? flatten(value, output) : output.push(value);
  }
  return output;
}
