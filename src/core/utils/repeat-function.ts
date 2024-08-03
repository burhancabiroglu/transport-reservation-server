export function repeat<T>(n: number, callback: () => T) {
  const list: T[] = [];
  for (let index = 0; index < n; index++) {
    list.push(callback());
  }
  return list;
}

export async function repeatPromise(
  n: number,
  callback: () => Promise<void>,
): Promise<void> {
  await Promise.all(
    Array(n)
      .fill(0)
      .map(async () => {
        await callback();
      }),
  );
}
