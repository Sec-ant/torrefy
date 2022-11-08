import { v4 } from "uuid";
import { BYTE_0 } from "./decode.js";
/**
 * A helper function to determine the index
 * of a new value in an existed sorted array
 * @param array an existed sorted array
 * @param value the new value whose index is to be determined
 * @param compareFunction a compare function to determine the order, like the one in Array.prototype.sort()
 * @returns index of the value in the sorted array
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
    if (compareFunction(array[mid], value) < 0) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
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
    sorted.splice(getSortedIndex(sorted, item, compareFunction), 0, item);
  }
  return sorted;
}

/**
 * Calculate the root hash of the merkle tree
 * constructed by given leaves
 * @param leaves merkle leaves
 * @returns root hash
 */
export async function merkleRoot(leaves: Uint8Array[]): Promise<Uint8Array> {
  const hashee = new Uint8Array(64);
  while (leaves.length > 1) {
    let hashFlag = false;
    const hashResult: Uint8Array[] = [];
    for (const leaf of leaves) {
      if (!hashFlag) {
        hashee.set(leaf);
        hashFlag = true;
      } else {
        hashee.set(leaf, 32);
        hashResult.push(
          new Uint8Array(await crypto.subtle.digest("SHA-256", hashee))
        );
        hashFlag = false;
      }
    }
    leaves = hashResult;
  }
  return leaves[0];
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
 * Collapse announce list
 * @param announceList
 * @returns collapsed announce list
 */
export function collapseAnnounceList(
  announceList: string[][] | undefined
): string[][] | undefined {
  if (typeof announceList === "undefined") {
    return undefined;
  }
  const collapsedAnnounceList: string[][] = [];
  for (const tier of announceList) {
    if (tier.length === 0) {
      continue;
    }
    collapsedAnnounceList.push(tier);
  }
  if (collapsedAnnounceList.length === 0) {
    return undefined;
  }
  return collapsedAnnounceList;
}

/**
 * Get the common directory of a list of files
 * @param files
 * @returns common directory
 */
export function getCommonDir(files: File[]): string | undefined {
  let directoryName: string | undefined;
  for (const file of files) {
    const path = (file.webkitRelativePath || file.name).split("/");
    if (path.length == 1 || (directoryName ??= path[0]) !== path[0]) {
      return undefined;
    }
  }
  return directoryName;
}

/**
 * Pad files
 * @param files the files to be padded
 * @param pieceLength piece length
 * @param commonDir common directory
 * @returns padded list of files
 */
export function padFiles(
  files: File[],
  pieceLength: number,
  commonDir: string | undefined = undefined
) {
  const newFiles: File[] = [];
  const lastFileIndex = files.length - 1;
  for (const [index, file] of files.entries()) {
    newFiles.push(file);
    if (index === lastFileIndex) {
      break;
    }
    const remainderSize = file.size % pieceLength;
    if (remainderSize === 0) {
      continue;
    }
    const paddingSize = pieceLength - remainderSize;
    const paddingFile = new File(
      [new ArrayBuffer(paddingSize)],
      `${paddingSize}`,
      {
        type: "application/octet-stream",
      }
    );
    const paddingFilePath = `.pad/${paddingSize}`;
    const nestedPath =
      typeof commonDir === "undefined"
        ? paddingFilePath
        : `${commonDir}/${paddingFilePath}`;
    Object.defineProperties(paddingFile, {
      webkitRelativePath: {
        configurable: true,
        enumerable: true,
        get: () => nestedPath,
      },
      padding: {
        configurable: true,
        enumerable: false,
        get: () => true,
      },
    });
    newFiles.push(paddingFile);
  }
  return newFiles;
}

/**
 * Decide torrent name
 * @param name
 * @param commonDir
 * @param files
 * @returns name
 */
export function decideName(
  name: string | undefined,
  commonDir: string | undefined,
  files: File[]
): string {
  if (typeof commonDir === "undefined" && files.length === 1) {
    name = files[0].name;
  } else {
    name ??= commonDir || v4();
  }
  return name;
}

/**
 * Calculate piece length from file size
 * @param fileSize
 * @returns
 */
export function calculatePieceLength(fileSize: number, blockLength: number) {
  return Math.max(blockLength, nextPowerOfTwo(fileSize >>> 10));
}

/**
 * is byte digit
 * @param byte
 * @returns
 */
export function isDigit(byte: number) {
  if (byte >= BYTE_0 && byte <= BYTE_0 + 9) {
    return true;
  }
  return false;
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
