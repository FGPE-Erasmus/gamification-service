export function sleep(time = 1000): Promise<any> {
  return new Promise(res => setTimeout(res, time, 'done sleeping'));
}

export async function setIntervalAsync(func, interval): Promise<void> {
  while ( true ) {
    await func();
    await sleep(interval);
  }
}
