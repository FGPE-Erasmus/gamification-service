export function pick<O, T extends keyof O>(keys: T[], obj: O): { [K in T]: O[T] } {
  const picker: (arg: O) => { [K in T]: O[T] } = _obj =>
    keys.reduce((acc, key) => {
      if (key in _obj) {
        acc[key] = _obj[key];
      }
      return acc;
    }, {} as O);

  return picker(obj);
}
