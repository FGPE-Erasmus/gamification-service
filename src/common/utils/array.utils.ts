export function arrayToObject(array: any[], key: string): { [key: string]: any } {
  return array.reduce((acc, curr) => {
    acc[curr[key]] = curr;
    return acc;
  }, {});
}

export function createTree(array: any[], key = 'id', parentKey = 'parentId', childrenProp = 'children'): any[] {
  const hashTable = Object.create(null);
  array.forEach((value: any) => (hashTable[value[key]] = { ...value, [childrenProp]: [] }));
  const tree = [];
  array.forEach(value => {
    if (value[parentKey]) {
      hashTable[value[parentKey]][childrenProp].push(hashTable[value[key]]);
    } else {
      tree.push(hashTable[value[key]]);
    }
  });
  return tree;
}

export function parseArray(s: string): string[] {
  return s ? s.split(/[,;]\s+?/).filter(sx => !!sx) : [];
}
