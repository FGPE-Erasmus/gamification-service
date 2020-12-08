//eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const wait = (time: number) => new Promise(resolve => setTimeout(() => resolve(time), time));
