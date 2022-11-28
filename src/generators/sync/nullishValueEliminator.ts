export function* nullishValueEliminator<K, V>(
  entries: Iterable<[key: K, value: V]>
) {
  for (const entry of entries) {
    if (typeof entry[1] === "undefined" || entry[1] === null) {
      continue;
    }
    yield entry;
  }
}
