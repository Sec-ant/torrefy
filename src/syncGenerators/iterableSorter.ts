import { getSortedIndex } from "../utils/misc.js";

export interface IterableSorterOptions<T> {
  compareFunction: (a: T, b: T) => number;
}

export function* iterableSorter<T>(
  iterable: Iterable<T>,
  { compareFunction }: IterableSorterOptions<T>
) {
  const sorted: T[] = [];
  for (const item of iterable) {
    const { index } = getSortedIndex(sorted, item, compareFunction);
    sorted.splice(index, 0, item);
  }
  for (const item of sorted) {
    yield item;
  }
}
