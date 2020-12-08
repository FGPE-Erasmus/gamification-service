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

export function shuffleArray<T>(input: T[]): Array<T> {
  const output = [...input];
  for (let i = output.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
}

export function intersection(a1: any[], a2: any[]): Array<any> {
  return a1.filter(x => a2.includes(x));
}

export function difference(a1: any[], a2: any[]): Array<any> {
  return a1.filter(x => !a2.includes(x));
}
