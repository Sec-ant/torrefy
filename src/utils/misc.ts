/**
 * A helper function to determine the index
 * of a new value in an existed sorted array
 * @param array an existed sorted array
 * @param value the new value whose index is to be determined
 * @param compareFunction a compare function to determine the order, like the one in Array.prototype.sort()
 * @returns index of the value in the sorted array and indexed result if found
 */
export function getSortedIndex<T, V>(
  array: T[],
  value: V,
  compareFunction: (a: T, b: V) => number
) {
  let low = 0;
  let high = array.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    const result = array[mid] as T;
    const compareResult = compareFunction(result, value);
    if (compareResult === 0) {
      return {
        index: mid,
        result: array[mid],
      };
    }
    if (compareResult < 0) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return {
    index: low,
    result: undefined,
  };
}

/**
 * Sort iterable into a sorted array
 * @param iterable
 * @param compareFunction
 * @returns sorted array
 */
export function iterableSort<T>(
  iterable: IterableIterator<T>,
  compareFunction: (a: T, b: T) => number
) {
  const sorted: T[] = [];
  for (const item of iterable) {
    const { index } = getSortedIndex(sorted, item, compareFunction);
    sorted.splice(index, 0, item);
  }
  return sorted;
}

/**
 * concat uint8 arrays
 * @param uint8Arrays
 * @returns
 */
export function concatUint8Arrays(...uint8Arrays: Uint8Array[]) {
  const result = new Uint8Array(
    uint8Arrays.reduce(
      (length, uint8Array) => length + uint8Array.byteLength,
      0
    )
  );
  uint8Arrays.reduce((offset, uint8Array) => {
    result.set(uint8Array, offset);
    return offset + uint8Array.byteLength;
  }, 0);
  return result;
}

/**
 * Calculate the next nearest power of 2
 * @param number number
 * @returns next nearest power of 2
 */
export function nextPowerOfTwo(number: number) {
  return 1 << (32 - Math.clz32(number - 1));
}

/**
 * Get time stamp seconds now
 * @returns time stamp now in seconds
 */
export function getTimeStampSecondsNow() {
  return Math.round(Date.now() / 1000);
}

/**
 * Calculate the root hash of the merkle tree
 * constructed by given leaves
 * @param leaves merkle leaves
 * @returns root hash
 */
export async function merkleRoot(leaves: Uint8Array[]): Promise<Uint8Array> {
  if (leaves.length === 0) {
    throw new Error("Empty leaves");
  }
  const content = new Uint8Array(64);
  while (leaves.length > 1) {
    let hashFlag = false;
    const hashResult: Uint8Array[] = [];
    for (const leaf of leaves) {
      if (!hashFlag) {
        content.set(leaf);
        hashFlag = true;
      } else {
        content.set(leaf, 32);
        let hash: Uint8Array;
        try {
          hash = new Uint8Array(await crypto.subtle.digest("SHA-256", content));
        } catch {
          const { default: jsSHA256 } = await import("jssha/sha256");
          const sha256Obj = new jsSHA256("SHA-256", "UINT8ARRAY");
          sha256Obj.update(content);
          hash = sha256Obj.getHash("UINT8ARRAY");
        }
        hashResult.push(hash);
        hashFlag = false;
      }
    }
    leaves = hashResult;
  }
  return leaves[0] as Uint8Array;
}
