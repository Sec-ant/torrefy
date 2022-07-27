import { v4 } from "uuid";
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

import { FileNodeValue, DirNodeValue, FileTree } from "./create";
type FileEntry = [key: string, value: FileNodeValue];
type DirEntry = [key: string, value: Entries];
type Entries = (FileEntry | DirEntry)[];
type FileNodeMap = WeakMap<FileNodeValue, File>;
/**
 * Parse an array of files into a file tree
 * and return the sorted file nodes
 * @param files an array of files
 * @returns file tree, file node map and common directory
 */
export function parseFileTree(files: File[]): {
  fileTree: FileTree;
  fileNodeMap: FileNodeMap;
  commonDir: string | undefined;
} {
  let rootEntries: Entries = [];

  const fileNodeMap: FileNodeMap = new WeakMap();

  for (const file of files) {
    const pathArray = (file.webkitRelativePath || file.name).split("/");
    pathArray.reduce(
      (entries: Entries | FileNodeValue, currentPathSegment, index) => {
        entries = entries as Entries;
        let entry: FileEntry | DirEntry | undefined = entries.find(
          (entry) => entry[0] === currentPathSegment
        );
        if (entry) {
          return entry[1];
        }
        const insertIndex = getSortedIndex(
          entries,
          currentPathSegment,
          (a, b) => (a[0] < b ? -1 : 1)
        );
        if (index === pathArray.length - 1) {
          const fileNode = {
            "": {
              length: file.size,
            },
          };
          fileNodeMap.set(fileNode, file);
          entry = [currentPathSegment, fileNode];
        } else {
          entry = [currentPathSegment, []];
        }
        entries.splice(insertIndex, 0, entry);

        return entry[1];
      },
      rootEntries
    );
  }

  let commonDir: string | undefined;
  if (rootEntries.length === 1 && Array.isArray(rootEntries[0][1])) {
    commonDir = rootEntries[0][0];
    rootEntries = rootEntries[0][1];
  }

  const sortedFileNodes: FileNodeValue[] = [];

  const fileTree: FileTree = {
    *[Symbol.iterator]() {
      for (const fileNode of sortedFileNodes) {
        yield fileNode;
      }
    },
    ...(getDirOrFileNode(rootEntries) as DirNodeValue),
  };

  return {
    fileTree,
    fileNodeMap,
    commonDir,
  };

  function getDirOrFileNode(entries: Entries | FileNodeValue) {
    if (Array.isArray(entries)) {
      const dirNode: DirNodeValue = {};
      for (const entry of entries) {
        dirNode[entry[0]] = getDirOrFileNode(entry[1]);
      }
      return dirNode;
    } else {
      const fileNode = entries;
      sortedFileNodes.push(fileNode);
      return fileNode;
    }
  }
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

import { AnnounceList } from "./create";
export function sanitizeAnnounceList(
  announceList: AnnounceList | undefined
): AnnounceList | undefined {
  if (typeof announceList === "undefined") {
    return undefined;
  }
  const sanitizedAnnounceList: AnnounceList = [];
  for (const tier of announceList) {
    if (tier.length === 0) {
      continue;
    }
    sanitizedAnnounceList.push(tier);
  }
  if (sanitizedAnnounceList.length === 0) {
    return undefined;
  }
  return sanitizedAnnounceList;
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

export function setName(
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
