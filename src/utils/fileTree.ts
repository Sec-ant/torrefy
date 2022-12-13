import {
  FileDirLike,
  FileDirLikes,
  isFile,
  isFileSystemDirectoryEntry,
  isFileSystemDirectoryHandle,
  isFileSystemFileEntry,
  isFileSystemFileHandle,
  getFileOfFileEntry,
  getEntriesOfDirEntry,
} from "./fileDirLike.js";

import { BObject } from "./codec.js";

import { getSortedIndex } from "./misc.js";
import { v4 } from "uuid";

/**
 * symlink file attribute
 */
export type SymlinkAttr = "s";

/**
 * executable file attribute
 */
export type ExecutableAttr = "x";

/**
 * hidden file attribute
 */
export type HiddenAttr = "h";

/**
 * padding file attribute
 */
export type PaddingFileAttr = "p";

/**
 * permutations template
 */
export type Permutations<
  T extends string,
  U extends string = T
> = T extends unknown ? T | `${T}${Permutations<Exclude<U, T>>}` : never;

/**
 * file attributes
 */
export type FileAttrs = Permutations<
  SymlinkAttr | ExecutableAttr | HiddenAttr | PaddingFileAttr
>;

/**
 * base file props
 */
export interface FilePropsBase extends BObject<false> {
  /**
   * Length of the file in bytes
   *
   * [BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=the%20following%20keys%3A-,length,-%2D%20The%20length%20of)
   * |
   * [BEP 52](https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=pieces%20root32%3Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaeeeeeee-,length,-Length%20of%20the)
   */
  length: number;
  /**
   * A variable-length string. When present,
   * the characters each represent a file attribute:
   * ```
   * l = symlink
   * x = executable
   * h = hidden
   * p = padding file
   * ```
   * [BEP 47](https://www.bittorrent.org/beps/bep_0047.html#:~:text=20%20bytes%3E%2C%0A%20%20%20%20...%0A%20%20%7D%2C%0A%20%20...%0A%7D-,attr,-A%20variable%2Dlength)
   */
  attr?: FileAttrs;
}

/**
 * v1 file props
 */
export interface FilePropsV1 extends FilePropsBase {
  /**
   * A list of UTF-8 encoded strings
   * corresponding to **subdirectory** names
   *
   * [BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=file%2C%20in%20bytes.-,path,-%2D%20A%20list%20of)
   */
  path: string[];
}

/**
 * v2 file props
 */
export interface FilePropsV2 extends FilePropsBase {
  /**
   * For **non-empty** files this is the the root hash
   * of a merkle tree with a branching factor of 2,
   * constructed from 16KiB blocks of the file
   *
   * [BEP 52](https://www.bittorrent.org/beps/bep_0052.html#:~:text=any%20sibling%20entries.-,pieces%20root,-For%20non%2Dempty)
   */
  ["pieces root"]?: ArrayBuffer;
}

/**
 * v1 file list
 */
export type FileListV1 = FilePropsV1[];

/**
 * v2 file tree file node
 */
export interface FileTreeFileNode extends BObject<false> {
  /**
   * Entries with zero-length keys describe the properties
   * of the composed path at that point
   *
   * [BEP 52](https://www.bittorrent.org/beps/bep_0052.html#:~:text=Entries%20with%20zero%2Dlength%20keys%20describe%20the%20properties%20of%20the%20composed%20path%20at%20that%20point)
   */
  "": FilePropsV2;
}

/**
 * v2 file entry
 */
export type FileTreeFileEntry = [filename: string, value: FileTreeFileNode];

/**
 * v2 file tree dir node
 */
export type FileTreeDirNode = Map<string, FileTreeDirNode | FileTreeFileNode>;

/**
 * v2 dir entry
 */
export type FileTreeDirEntry = [dirname: string, value: FileTreeEntries];

/**
 * v2 packed dir entry
 */
export type PackedFileTreeDirEntry = [dirname: string, value: FileTreeDirNode];

/**
 * v2 file or dir entries
 */
export type FileTreeEntries = (FileTreeFileEntry | FileTreeDirEntry)[];

/**
 * v2 packed file or dir entries
 */
export type PackedFileTreeEntries = (
  | FileTreeFileEntry
  | PackedFileTreeDirEntry
)[];

export function resolveCommonDirAndTorrentName(
  name: string | undefined,
  fileTree: FileTreeDirNode
): { name: string; commonDir: string | undefined } {
  // zero or multi file or folders
  if (fileTree.size > 1 || fileTree.size === 0) {
    return {
      // TODO: change UUID v4 to v5 ?
      name: name || v4(),
      commonDir: undefined,
    };
  }
  const [firstNodeName, firstNode] = fileTree.entries().next().value as
    | FileTreeFileEntry
    | PackedFileTreeDirEntry;
  // one file
  if (isFileTreeFileNode(firstNode)) {
    return {
      name: name || firstNodeName,
      commonDir: undefined,
    };
  }
  // one dir
  return {
    name: name || firstNodeName,
    commonDir: firstNodeName,
  };
}

interface PopulateOptions {
  sort?: boolean;
  compareFunction?: (
    entry: FileTreeFileEntry | FileTreeDirEntry,
    name: string
  ) => number;
  polyfillWebkitRelativePath?: boolean;
}

export type TraverseTree = (
  node: FileTreeDirNode | FileTreeFileNode
) => Generator<[FileTreeFileNode, File], void, unknown>;

type FileDirLikeIterator =
  | Iterator<FileDirLike, void>
  | AsyncIterator<FileDirLike, void>;

type FileTreeEntryIterator = Iterator<
  FileTreeFileEntry | FileTreeDirEntry,
  void
>;

type FileTreeNodeIterator = Iterator<FileTreeDirNode | FileTreeFileNode, void>;

/**
 * Parse file-dir-likes into a file tree
 * @param fileDirLikes
 * @param opts populate options
 * @returns file tree and a traverse function
 */
export async function populateFileTree(
  fileDirLikes: FileDirLikes,
  {
    sort = true,
    compareFunction = compareEntryNames,
    polyfillWebkitRelativePath = true,
  }: PopulateOptions = {
    sort: true,
    compareFunction: compareEntryNames,
    polyfillWebkitRelativePath: true,
  }
): Promise<{
  fileTree: FileTreeDirNode;
  traverseTree: TraverseTree;
  totalFileSize: number;
  totalFileCount: number;
}> {
  let totalFileSize = 0;
  let totalFileCount = 0;
  // weak map for internal use
  const fileEntryToHandleMap: WeakMap<FileTreeFileEntry, FileSystemFileHandle> =
    new WeakMap();
  const dirEntryToHandleMap: WeakMap<
    FileTreeDirEntry,
    FileSystemDirectoryHandle
  > = new WeakMap();
  // weak map for traversal
  const fileNodeToFileMap: WeakMap<FileTreeFileNode, File> = new WeakMap();
  // states
  const rootDirEntry: FileTreeDirEntry = ["file tree", []];
  const dirEntryStack: FileTreeDirEntry[] = [rootDirEntry];
  const fileDirLikeIteratorStack: FileDirLikeIterator[] = [
    Symbol.iterator in fileDirLikes
      ? fileDirLikes[Symbol.iterator]()
      : fileDirLikes[Symbol.asyncIterator](),
  ];
  // flag: should deep pack
  let shouldDeepPack = false;
  while (fileDirLikeIteratorStack.length) {
    // peek last member of the stack
    const currentDirEntry = dirEntryStack.at(-1) as FileTreeDirEntry;
    const currentFileDirLikeIterator = fileDirLikeIteratorStack.at(
      -1
    ) as FileDirLikeIterator;
    // get next file dir like
    const { value: fileDirLike, done } =
      await currentFileDirLikeIterator.next();
    // done: pop stack and pack entries to map in places
    if (done) {
      fileDirLikeIteratorStack.pop();
      const subDirEntry = dirEntryStack.pop() as FileTreeDirEntry;
      if (!shouldDeepPack) {
        // NOTE: TYPE MUTATION!
        (subDirEntry[1] as unknown as FileTreeDirNode) = new Map<
          string,
          FileTreeDirNode | FileTreeFileNode
        >(subDirEntry[1] as PackedFileTreeEntries);
      }
      continue;
    }
    // flags to narrow the file-dir-like type
    // flag: input is file
    const inputIsFile = isFile(fileDirLike);
    // flag: input is file system directory handle
    const inputIsFileSystemDirectoryHandle =
      isFileSystemDirectoryHandle(fileDirLike);
    // flag: input is file system directory entry
    const inputIsFileSystemDirectoryEntry =
      isFileSystemDirectoryEntry(fileDirLike);
    // flag: input is file system file handle
    const inputIsFileSystemFileHandle = isFileSystemFileHandle(fileDirLike);
    // flag: input is file system file entry
    const inputIsFileSystemFileEntry = isFileSystemFileEntry(fileDirLike);
    // file-dir-like is a directory handle or entry
    if (inputIsFileSystemDirectoryHandle || inputIsFileSystemDirectoryEntry) {
      // get directory name
      const dirName = fileDirLike.name;
      // get index and match result
      let index: number;
      let result: FileTreeFileEntry | FileTreeDirEntry | undefined;
      if (sort) {
        // binary search the name in the current directory entry
        ({ index, result } = getSortedIndex(
          currentDirEntry[1],
          dirName,
          compareFunction
        ));
      } else {
        // naive search
        result = currentDirEntry[1].find((entry) => entry[0] === dirName);
        index = currentDirEntry[1].length;
      }
      // reassign the search result
      let subDirEntry = result;
      // a matched file entry is found
      if (isFileTreeFileEntry(subDirEntry)) {
        throw new Error("A same name file already exists");
      }
      // a matched directory entry is found
      // check whether they point to the same directory
      if (isFileTreeDirEntry(subDirEntry) && inputIsFileSystemDirectoryHandle) {
        const registeredHandle = dirEntryToHandleMap.get(subDirEntry);
        const isUnregistered =
          !registeredHandle ||
          !(await fileDirLike.isSameEntry(registeredHandle));
        if (isUnregistered) {
          throw new Error("A same name directory already exists");
        }
      }
      // no matched directory entry is found
      // create a new one and insert
      if (!subDirEntry) {
        subDirEntry = [dirName, []];
        currentDirEntry[1].splice(index, 0, subDirEntry);
        if (inputIsFileSystemDirectoryHandle) {
          dirEntryToHandleMap.set(subDirEntry, fileDirLike);
        }
      }
      // push dir entry stack
      dirEntryStack.push(subDirEntry);
      // push file-dir-likes stack
      const subFileDirLikes = inputIsFileSystemDirectoryHandle
        ? fileDirLike.values()
        : getEntriesOfDirEntry(fileDirLike);
      const subFileDirLikesIterator = subFileDirLikes[Symbol.asyncIterator]();
      fileDirLikeIteratorStack.push(subFileDirLikesIterator);
      // start next iteration
      continue;
    }
    // file-dir-like is a file handle or entry
    else if (inputIsFileSystemFileHandle || inputIsFileSystemFileEntry) {
      // get file name
      const fileName = fileDirLike.name;
      // get index and match result
      let index: number;
      let result: FileTreeFileEntry | FileTreeDirEntry | undefined;
      if (sort) {
        // binary search the name in the current directory entry
        ({ index, result } = getSortedIndex(
          currentDirEntry[1],
          fileName,
          compareFunction
        ));
      } else {
        // naive search
        result = currentDirEntry[1].find((entry) => entry[0] === fileName);
        index = currentDirEntry[1].length;
      }
      // reassign the search result
      let fileEntry = result;
      // a matched file entry is found
      // check whether they point to te same file
      if (isFileTreeFileEntry(fileEntry) && inputIsFileSystemFileHandle) {
        const registeredHandle = fileEntryToHandleMap.get(fileEntry);
        const isUnregistered =
          !registeredHandle ||
          !(await fileDirLike.isSameEntry(registeredHandle));
        if (isUnregistered) {
          throw new Error("A same name file already exists");
        }
      }
      // a matched directory entry is found
      if (isFileTreeDirEntry(fileEntry)) {
        throw new Error("A same name directory already exists");
      }
      // this file entry has been visited
      // start next iteration
      if (fileEntry) {
        continue;
      }
      // no matched file entry is found
      // create a new one and insert
      const file = await (inputIsFileSystemFileHandle
        ? fileDirLike.getFile()
        : getFileOfFileEntry(fileDirLike));
      const fileSize = file.size;
      if (polyfillWebkitRelativePath) {
        const webkitRelativePath =
          dirEntryStack.reduce(
            (prevPath, dirEntry, index) =>
              index === 0 ? prevPath : prevPath + dirEntry[0] + "/",
            ""
          ) + file.name;
        Object.defineProperty(file, "webkitRelativePath", {
          configurable: true,
          enumerable: true,
          get: () => webkitRelativePath,
        });
      }
      const fileTreeFileNode: FileTreeFileNode = {
        "": {
          length: fileSize,
        },
      };
      fileEntry = [fileName, fileTreeFileNode];
      currentDirEntry[1].splice(index, 0, fileEntry);
      if (inputIsFileSystemFileHandle) {
        fileEntryToHandleMap.set(fileEntry, fileDirLike);
      }
      fileNodeToFileMap.set(fileTreeFileNode, file);
      totalFileSize += fileSize;
      totalFileCount += 1;
      // start next iteration
      continue;
    }
    // file-dir-like is a file
    else if (inputIsFile) {
      // use file name to polyfill empty webkitRelativePath
      if (polyfillWebkitRelativePath && fileDirLike.webkitRelativePath === "") {
        Object.defineProperty(fileDirLike, "webkitRelativePath", {
          configurable: true,
          enumerable: true,
          get: () => fileDirLike.name,
        });
      }
      // get file path segments
      const pathSegments = (
        fileDirLike.webkitRelativePath || fileDirLike.name
      ).split("/");
      // init a local directory entry stack
      const localDirEntryStack = [rootDirEntry];
      // parse path segments to a tree
      for (const [segmentIndex, pathSegment] of pathSegments.entries()) {
        if (segmentIndex >= 1) {
          shouldDeepPack = true;
        }
        // peek last member of the stack
        const localCurrentDirEntry = localDirEntryStack.at(
          -1
        ) as FileTreeDirEntry;
        // get index and match result
        let index: number;
        let result: FileTreeFileEntry | FileTreeDirEntry | undefined;
        if (sort) {
          // binary search the path segment in the current directory entry
          ({ index, result } = getSortedIndex(
            localCurrentDirEntry[1],
            pathSegment,
            compareFunction
          ));
        } else {
          // naive search
          result = currentDirEntry[1].find((entry) => entry[0] === pathSegment);
          index = currentDirEntry[1].length;
        }
        // path segment is a directory name
        if (segmentIndex < pathSegments.length - 1) {
          // reassign the search result
          let subDirEntry = result;
          // a matched file entry is found
          if (isFileTreeFileEntry(subDirEntry)) {
            throw new Error("A same name file already exists");
          }
          // no matched directory entry is found
          // create a new one and insert
          if (!subDirEntry) {
            subDirEntry = [pathSegment, []];
            localCurrentDirEntry[1].splice(index, 0, subDirEntry);
          }
          // push dir entry to local stack
          localDirEntryStack.push(subDirEntry);
        }
        // path segment is a file name
        else {
          // reassign the search result
          let fileEntry = result;
          // a matched directory entry is found
          if (isFileTreeDirEntry(fileEntry)) {
            throw new Error("A same name directory already exists");
          }
          // this file entry has been visited
          // iteration is over
          if (fileEntry) {
            continue;
          }
          // no matched file entry is found
          // create a new one and insert
          const fileSize = fileDirLike.size;
          const fileTreeFileNode: FileTreeFileNode = {
            "": {
              length: fileSize,
            },
          };
          fileEntry = [pathSegment, fileTreeFileNode];
          localCurrentDirEntry[1].splice(index, 0, fileEntry);
          fileNodeToFileMap.set(fileTreeFileNode, fileDirLike);
          totalFileSize += fileSize;
          totalFileCount += 1;
        }
      }
      continue;
    }
    // unrecognized type
    else {
      throw new TypeError("Unrecognized type of input");
    }
  }
  // NOTE: TYPE MUTATION!
  if (shouldDeepPack) {
    const dirEntryStack: FileTreeDirEntry[] = [rootDirEntry];
    const fileTreeEntryIteratorStack: FileTreeEntryIterator[] = [
      rootDirEntry[1][Symbol.iterator](),
    ];
    while (dirEntryStack.length) {
      const currentFileTreeEntryIterator = fileTreeEntryIteratorStack.at(
        -1
      ) as FileTreeEntryIterator;
      const { value, done } = currentFileTreeEntryIterator.next();
      if (done) {
        fileTreeEntryIteratorStack.pop();
        const subDirEntry = dirEntryStack.pop() as FileTreeDirEntry;
        // NOTE: TYPE MUTATION!
        (subDirEntry[1] as unknown as FileTreeDirNode) = new Map<
          string,
          FileTreeDirNode | FileTreeFileNode
        >(subDirEntry[1] as PackedFileTreeEntries);
        continue;
      }
      if (isFileTreeDirEntry(value)) {
        dirEntryStack.push(value);
        fileTreeEntryIteratorStack.push(value[1][Symbol.iterator]());
      }
    }
  }
  return {
    // NOTE: FORCE TYPE CAST!
    fileTree: rootDirEntry[1] as unknown as FileTreeDirNode,
    traverseTree,
    totalFileSize,
    totalFileCount,
  };
  // traverse tree function
  function* traverseTree(
    node: FileTreeDirNode | FileTreeFileNode
  ): Generator<[FileTreeFileNode, File], void, unknown> {
    const fileTreeNodeIteratorStack: FileTreeNodeIterator[] = [
      [node][Symbol.iterator](),
    ];
    while (fileTreeNodeIteratorStack.length) {
      const currentFileTreeNodeIterator = fileTreeNodeIteratorStack.at(
        -1
      ) as FileTreeNodeIterator;
      const { value: currentNode, done } = currentFileTreeNodeIterator.next();
      if (done) {
        fileTreeNodeIteratorStack.pop();
        continue;
      }
      if (isFileTreeDirNode(currentNode)) {
        fileTreeNodeIteratorStack.push(currentNode.values()[Symbol.iterator]());
        continue;
      } else {
        yield [currentNode, fileNodeToFileMap.get(currentNode) as File];
      }
    }
  }
}

export function isFileTreeFileNode(
  node: FileTreeFileNode | FileTreeDirNode | undefined
): node is FileTreeFileNode {
  return node ? "" in node : false;
}

export function isFileTreeDirNode(
  node: FileTreeFileNode | FileTreeDirNode | undefined
): node is FileTreeDirNode {
  return node instanceof Map;
}

export function isFileTreeFileEntry(
  entry: FileTreeFileEntry | FileTreeDirEntry | undefined
): entry is FileTreeFileEntry {
  return entry ? "" in entry[1] : false;
}

export function isFileTreeDirEntry(
  entry: FileTreeFileEntry | FileTreeDirEntry | undefined
): entry is FileTreeDirEntry {
  return entry ? !("" in entry[1]) : false;
}

// compare function
export function compareEntryNames(
  entry: FileTreeFileEntry | FileTreeDirEntry,
  name: string
) {
  return entry[0] < name ? -1 : entry[0] > name ? 1 : 0;
}
