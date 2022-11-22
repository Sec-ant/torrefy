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
type SymlinkAttr = "s";

/**
 * executable file attribute
 */
type ExecutableAttr = "x";

/**
 * hidden file attribute
 */
type HiddenAttr = "h";

/**
 * padding file attribute
 */
type PaddingFileAttr = "p";

/**
 * permutations template
 */
type Permutations<T extends string, U extends string = T> = T extends unknown
  ? T | `${T}${Permutations<Exclude<U, T>>}`
  : never;

/**
 * file attributes
 */
export type FileAttrs = Permutations<
  SymlinkAttr | ExecutableAttr | HiddenAttr | PaddingFileAttr
>;

/**
 * base file props
 */
interface FilePropsBase extends BObject<false> {
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
export type FilesList = FilePropsV1[];

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

export type PopulateOptions =
  | {
      sort?: false;
      compareFunction?: never;
      polyfillWebkitRelativePath?: boolean;
    }
  | {
      sort?: true;
      compareFunction?: (
        entry: FileTreeFileEntry | FileTreeDirEntry,
        name: string
      ) => number;
      polyfillWebkitRelativePath?: boolean;
    };

export type TraverseTree = (
  node: FileTreeDirNode | FileTreeFileNode
) => Generator<[FileTreeFileNode, File], void, unknown>;

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
  // flag: should deep pack
  let shouldDeepPack = false;
  // recursively populate
  for await (const fileDirLike of fileDirLikes) {
    await recursivelyPopulateFileTree(fileDirLike);
  }
  return {
    // NOTE: TYPE MUTATION!
    fileTree: packEntriesToDirNode(rootDirEntry[1], shouldDeepPack),
    traverseTree,
    totalFileSize,
    totalFileCount,
  };
  // recursive function
  async function recursivelyPopulateFileTree(fileDirLike: FileDirLike) {
    // get current entry
    const currentDirEntry = dirEntryStack.at(-1);
    if (!currentDirEntry) {
      throw new Error("This is a bug");
    }
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
    // directory handle or entry
    if (inputIsFileSystemDirectoryHandle || inputIsFileSystemDirectoryEntry) {
      const dirName = fileDirLike.name;
      const { index, result } = getSortedIndex(
        currentDirEntry[1],
        dirName,
        compareFunction
      );
      let subDirEntry = result;
      if (isFileTreeFileEntry(subDirEntry)) {
        throw new Error("A same name file already exists");
      }
      if (isFileTreeDirEntry(subDirEntry) && inputIsFileSystemDirectoryHandle) {
        const registeredHandle = dirEntryToHandleMap.get(subDirEntry);
        const isUnregistered =
          !registeredHandle ||
          !(await fileDirLike.isSameEntry(registeredHandle));
        if (isUnregistered) {
          throw new Error("File system handle not match");
        }
      }
      if (!subDirEntry) {
        subDirEntry = [dirName, []];
        sort
          ? currentDirEntry[1].splice(index, 0, subDirEntry)
          : currentDirEntry[1].push(subDirEntry);
        if (inputIsFileSystemDirectoryHandle) {
          dirEntryToHandleMap.set(subDirEntry, fileDirLike);
        }
      }
      dirEntryStack.push(subDirEntry);
      for await (const childFileSystemHandle of inputIsFileSystemDirectoryHandle
        ? fileDirLike.values()
        : getEntriesOfDirEntry(fileDirLike)) {
        await recursivelyPopulateFileTree(childFileSystemHandle);
      }
      // NOTE: TYPE MUTATION!
      (subDirEntry[1] as unknown as FileTreeDirNode) = new Map<
        string,
        FileTreeDirNode | FileTreeFileNode
      >(subDirEntry[1] as PackedFileTreeEntries);
      dirEntryStack.pop();
    }
    // file handle or entry
    else if (inputIsFileSystemFileHandle || inputIsFileSystemFileEntry) {
      const fileName = fileDirLike.name;
      const { index, result } = getSortedIndex(
        currentDirEntry[1],
        fileName,
        compareFunction
      );
      let fileEntry = result;
      if (isFileTreeFileEntry(fileEntry) && inputIsFileSystemFileHandle) {
        const registeredHandle = fileEntryToHandleMap.get(fileEntry);
        const isUnregistered =
          !registeredHandle ||
          !(await fileDirLike.isSameEntry(registeredHandle));
        if (isUnregistered) {
          throw new Error("A same name file already exists");
        }
      }
      if (isFileTreeDirEntry(fileEntry)) {
        throw new Error("A same name directory already exists");
      }
      if (fileEntry) {
        return;
      }
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
      sort
        ? currentDirEntry[1].splice(index, 0, fileEntry)
        : currentDirEntry[1].push(fileEntry);
      if (inputIsFileSystemFileHandle) {
        fileEntryToHandleMap.set(fileEntry, fileDirLike);
      }
      fileNodeToFileMap.set(fileTreeFileNode, file);
      totalFileSize += fileSize;
      totalFileCount += 1;
    }
    // file
    else if (inputIsFile) {
      if (polyfillWebkitRelativePath && fileDirLike.webkitRelativePath === "") {
        Object.defineProperty(fileDirLike, "webkitRelativePath", {
          configurable: true,
          enumerable: true,
          get: () => fileDirLike.name,
        });
      }
      const pathSegments = (
        fileDirLike.webkitRelativePath || fileDirLike.name
      ).split("/");
      const localDirEntryStack = [rootDirEntry];
      for (const [segmentIndex, pathSegment] of pathSegments.entries()) {
        if (segmentIndex >= 1) {
          shouldDeepPack = true;
        }
        const localCurrentDirEntry = localDirEntryStack.at(-1);
        if (!localCurrentDirEntry) {
          throw new Error("This is a bug");
        }
        const { index, result } = getSortedIndex(
          localCurrentDirEntry[1],
          pathSegment,
          compareFunction
        );
        // dir
        if (segmentIndex < pathSegments.length - 1) {
          let subDirEntry = result;
          if (isFileTreeFileEntry(subDirEntry)) {
            throw new Error("A same name file already exists");
          }
          if (!subDirEntry) {
            subDirEntry = [pathSegment, []];
            sort
              ? localCurrentDirEntry[1].splice(index, 0, subDirEntry)
              : localCurrentDirEntry[1].push(subDirEntry);
          }
          localDirEntryStack.push(subDirEntry);
        }
        // file
        else {
          let fileEntry = result;
          if (isFileTreeDirEntry(fileEntry)) {
            throw new Error("A same name directory already exists");
          }
          if (fileEntry) {
            return;
          }
          const fileSize = fileDirLike.size;
          const fileTreeFileNode: FileTreeFileNode = {
            "": {
              length: fileSize,
            },
          };
          fileEntry = [pathSegment, fileTreeFileNode];
          sort
            ? localCurrentDirEntry[1].splice(index, 0, fileEntry)
            : localCurrentDirEntry[1].push(fileEntry);
          fileNodeToFileMap.set(fileTreeFileNode, fileDirLike);
          totalFileSize += fileSize;
          totalFileCount += 1;
        }
      }
    }
    // unrecognized type
    else {
      throw new Error("Unrecognized type of input");
    }
  }
  // traverse function
  function* traverseTree(
    node: FileTreeDirNode | FileTreeFileNode
  ): Generator<[FileTreeFileNode, File], void, unknown> {
    if (isFileTreeDirNode(node)) {
      for (const subNode of node.values()) {
        yield* traverseTree(subNode);
      }
    } else {
      yield [node, fileNodeToFileMap.get(node) as File];
    }
  }
}

export function packEntriesToDirNode(
  entries: PackedFileTreeEntries | FileTreeEntries,
  shouldDeepPack = false
): FileTreeDirNode {
  if (shouldDeepPack) {
    recursivelyPack(entries as FileTreeEntries);
  }
  return new Map<string, FileTreeDirNode | FileTreeFileNode>(
    entries as PackedFileTreeEntries
  );
}

function recursivelyPack(fileTreeEntries: FileTreeEntries) {
  for (const fileTreeEntry of fileTreeEntries) {
    if (isFileTreeDirEntry(fileTreeEntry)) {
      const newEntries = fileTreeEntry[1];
      recursivelyPack(newEntries);
      (fileTreeEntry[1] as unknown as FileTreeDirNode) = new Map<
        string,
        FileTreeDirNode | FileTreeFileNode
      >(newEntries as PackedFileTreeEntries);
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
