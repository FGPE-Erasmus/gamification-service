export function pick<O, T extends keyof O>(keys: T[], obj: O): { [K in T]: O[T] } {
  const picker: (arg: O) => { [K in T]: O[T] } = (_obj: O) =>
    keys.reduce((acc, key) => {
      if (key in _obj) {
        acc[key] = _obj[key];
      }
      return acc;
    }, {} as O);

  return picker(obj);
}

export function omit<O, T extends keyof O>(keys: T[], obj: O): { [K in Exclude<keyof O, T>]: O[Exclude<keyof O, T>] } {
  const picker: (arg: O) => { [K in Exclude<keyof O, T>]: O[Exclude<keyof O, T>] } = (_obj: O) =>
    Object.keys(_obj).reduce((acc, key) => {
      if (!keys.includes(key as any)) {
        acc[key] = _obj[key];
      }
      return acc;
    }, {} as O);

  return picker(obj);
}
