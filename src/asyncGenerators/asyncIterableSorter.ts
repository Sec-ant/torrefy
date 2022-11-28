import { getSortedIndex } from "../utils/misc.js";

export interface AsyncIterableSorterOptions<T> {
  compareFunction: (a: T, b: T) => number;
}

export async function* asyncIterableSorter<T>(
  iterable: AsyncIterable<T>,
  { compareFunction }: AsyncIterableSorterOptions<T>
) {
  const sorted: T[] = [];
  for await (const item of iterable) {
    const { index } = getSortedIndex(sorted, item, compareFunction);
    sorted.splice(index, 0, item);
  }
  for (const item of sorted) {
    yield item;
  }
}
