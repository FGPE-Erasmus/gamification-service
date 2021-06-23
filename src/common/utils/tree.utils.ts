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

/* eslint-disable-next-line */
export function findSubtree(tree: any[], lookup: any, key = 'id', childrenProp = 'children'): any {
  if (!tree || tree.length === 0) {
    return undefined;
  }
  for (const node of tree) {
    if (node[key] === lookup) {
      return node;
    }
    const result = findSubtree(node[childrenProp], lookup, key, childrenProp);
    if (result) {
      return result;
    }
  }
  return undefined;
}

export function collectFromTree(tree: any[], lookupProp: string, childrenProp = 'children', depthFirst = true): any[] {
  if (!tree || tree.length === 0) {
    return [];
  }
  const collected = [];
  for (const node of tree) {
    collected.push(...node[lookupProp]);
    const result = collectFromTree(node[childrenProp], lookupProp, childrenProp, depthFirst);
    collected.push(...result);
  }
  return collected;
}
