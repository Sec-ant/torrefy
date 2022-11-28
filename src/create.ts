import { fromIterable } from "@sec-ant/readable-stream";
import { chunkRegulator } from "./generators/async/chunkRegulator.js";
import { chunkHasher } from "./generators/async/chunkHasher.js";
import { chunkPacker } from "./generators/async/chunkPacker.js";
import { chunkGrouper } from "./generators/async/chunkGrouper.js";
import { concatenator } from "./generators/async/concatenator.js";
import { merkleRootCalculator } from "./generators/async/merkleRootCalculator.js";
import { BObject } from "./utils/codec.js";
import {
  FileAttrs,
  FileListV1,
  FileTreeDirNode,
  FileTreeFileNode,
  populateFileTree,
  resolveCommonDirAndTorrentName,
} from "./utils/fileTree.js";
import { FileDirLikes } from "./utils/fileDirLike.js";
import { nextPowerOfTwo, getTimeStampSecondsNow } from "./utils/misc.js";

/**
 * support padding attribute on file
 */
declare global {
  interface File {
    readonly padding?: boolean;
  }
}

/**
 * created by: name + version
 * inject value when build
 */
declare const CREATED_BY: string;

/**
 * meta version can only be 2 at the time being
 */
export type MetaVersion = 2;

/**
 * torrent type: v1, v2, hybrid
 */
export type TorrentType = "v1" | "v2" | "hybrid";

/**
 * base torrent options
 */
export interface TorrentOptionsBase {
  /**
   * add created by whom
   */
  addCreatedBy?: boolean;
  /**
   * add creation date
   */
  addCreationDate?: boolean;
  /**
   * announce url
   */
  announce?: string;
  /**
   * announce url list
   */
  announceList?: string[][];
  /**
   * block length: 16384 (16 KiB) by default
   * (do not alter this value)
   */
  blockLength?: number;
  /**
   * comment
   */
  comment?: string;
  /**
   * is private torrent
   */
  isPrivate?: boolean;
  /**
   * torrent name
   */
  name?: string;
  /**
   * piece length: a power of 2 number,
   * will automatically calculate when this value is missing
   */
  pieceLength?: number;
  /**
   * source
   */
  source?: string;
  /**
   * url list
   *
   * [BEP 9](http://www.bittorrent.org/beps/bep_0019.html#metadata-extension)
   */
  urlList?: string[];
  type: TorrentType;
}

/**
 * v1 torrent options
 */
export interface TorrentOptionsV1 extends TorrentOptionsBase {
  /**
   * add padding files
   * this option is only available in V1 type torrents
   * because files are forcibly padded in HYBRID type
   * and don't need padding in V2 type
   */
  addPaddingFiles?: boolean;
  /**
   * sort file: only available in V1 type
   * files are forcibly sorted in V2 and HYBRID type
   */
  sortFiles?: boolean;
  /**
   * torrent type: V1
   */
  type: "v1";
}

/**
 * v2 torrent options
 */
export interface TorrentOptionsV2 extends TorrentOptionsBase {
  /**
   * meta version
   */
  metaVersion?: MetaVersion;
  /**
   * torrent type: V2
   */
  type: "v2";
}

/**
 * v1 + v2 hybrid torrent options
 */
export interface TorrentOptionsHybrid extends TorrentOptionsBase {
  /**
   * meta version
   */
  metaVersion?: MetaVersion;
  /**
   * torrent type: HYBRID
   */
  type: "hybrid";
}

/**
 * torrent options
 */
export type TorrentOptions<T extends TorrentType = TorrentType> = T extends "v1"
  ? TorrentOptionsV1
  : T extends "v2"
  ? TorrentOptionsV2
  : T extends "hybrid"
  ? TorrentOptionsHybrid
  : never;

type UnrequiredOptions =
  | "announce"
  | "announceList"
  | "comment"
  | "name"
  | "source"
  | "urlList";

type InternalTorrentOptionsV1 = TorrentOptionsV1 &
  Required<Omit<TorrentOptionsV1, UnrequiredOptions>>;

type InternalTorrentOptionsV2 = TorrentOptionsV2 &
  Required<Omit<TorrentOptionsV2, UnrequiredOptions>>;

type InternalTorrentOptionsHybrid = TorrentOptionsHybrid &
  Required<Omit<TorrentOptionsHybrid, UnrequiredOptions>>;

/**
 * internal torrent options
 */
type InternalTorrentOptions<T extends TorrentType = TorrentType> =
  T extends "v1"
    ? InternalTorrentOptionsV1
    : T extends "v2"
    ? InternalTorrentOptionsV2
    : T extends "hybrid"
    ? InternalTorrentOptionsHybrid
    : never;

//===================================================================================

/**
 * info base
 */
export interface InfoBase extends BObject<false> {
  /**
   * The suggested name to save the file (or directory) as.
   * It is purely advisory
   *
   * [BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=The-,name,-key%20maps%20to)
   * |
   * [BEP 52](https://www.bittorrent.org/beps/bep_0052.html#:~:text=info%20dictionary-,name,-A%20display%20name)
   */
  name: string;
  /**
   * The number of bytes that each logical piece
   * in the peer protocol refers to
   *
   * [BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=is%20purely%20advisory.-,piece%20length,-maps%20to%20the)
   * |
   * [BEP 52](https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=is%20purely%20advisory.-,piece%20length,-The%20number%20of)
   */
  ["piece length"]: number;
  /**
   * is private torrent
   */
  private?: boolean;
  /**
   * source
   */
  source?: string;
}

/**
 * v1 info base
 */
export interface InfoBaseV1 extends InfoBase {
  /**
   * Pieces maps to a string whose length is a multiple of 20
   *
   * [BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=M%20as%20default%29.-,pieces,-maps%20to%20a)
   */
  pieces: ArrayBuffer | string;
}

/**
 * v1 single file info
 */
export interface InfoSingleFileV1 extends InfoBaseV1 {
  length: number;
}

/**
 * v1 multi file info
 */
export interface InfoMultiFileV1 extends InfoBaseV1 {
  files: FileListV1;
}

/**
 * v1 info
 */
export type InfoV1 = InfoSingleFileV1 | InfoMultiFileV1;

/**
 * v2 info
 */
export interface InfoV2 extends InfoBase {
  /**
   * A tree of dictionaries where dictionary keys
   * represent UTF-8 encoded path elements
   *
   * [BEP 52](https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=about%20invalid%20files.-,file%20tree,-A%20tree%20of)
   */
  ["file tree"]: FileTreeDirNode;
  /**
   * An integer value, set to 2 to indicate compatibility
   * with the current revision of this specification
   *
   * [BEP 52](https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=an%20alignment%20gap.-,meta%20version,-An%20integer%20value)
   */
  ["meta version"]: number;
}

/**
 * hybrid single file info
 */
export interface InfoSingleFileHybrid extends InfoSingleFileV1, InfoV2 {}

/**
 * hybrid multi file info
 */
export interface InfoMultiFileHybrid extends InfoMultiFileV1, InfoV2 {}

/**
 * hybrid info
 */
export type InfoHybrid = InfoSingleFileHybrid | InfoMultiFileHybrid;

/**
 * info
 */
export type Info<T extends TorrentType = TorrentType> = T extends "v1"
  ? InfoV1
  : T extends "v2"
  ? InfoV2
  : T extends "hybrid"
  ? InfoHybrid
  : never;

//===================================================

/**
 * v2 piece layers
 */
export type PieceLayers = Map<ArrayBuffer, ArrayBuffer>;

/**
 * base meta info
 */
export interface MetaInfoBase extends BObject<false> {
  /**
   * The URL of the tracker
   *
   * [BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=the%20following%20keys%3A-,announce,-The%20URL%20of)
   * |
   * [BEP 52](https://www.bittorrent.org/beps/bep_0052.html#:~:text=the%20following%20keys%3A-,announce,-The%20URL%20of)
   */
  announce?: string;
  /**
   * This key will refer to a list of lists of URLs,
   * and will contain a list of tiers of announces
   *
   * [BEP 12](http://bittorrent.org/beps/bep_0012.html#:~:text=This%20key%20will%20refer%20to%20a%20list%20of%20lists%20of%20URLs%2C%20and%20will%20contain%20a%20list%20of%20tiers%20of%20announces)
   */
  ["announce-list"]?: string[][];
  /**
   * Free-form textual comments of the author
   *
   * [BitTorrent Specification](https://courses.edsa-project.eu/pluginfile.php/1514/mod_resource/content/0/bitTorrent_part2.htm#:~:text=00%3A00%20UTC%29-,comment,-%3A%20%28optional%29%20free%2Dform)
   */
  comment?: string;
  /**
   * Name and version of the program used to create the .torrent
   *
   * [BitTorrent Specification](https://courses.edsa-project.eu/pluginfile.php/1514/mod_resource/content/0/bitTorrent_part2.htm#:~:text=the%20author%20%28string%29-,created%20by,-%3A%20%28optional%29%20name%20and)
   */
  ["created by"]?: string;
  /**
   * The creation time of the torrent,
   * in standard UNIX epoch format
   *
   * [BitTorrent Specification](https://courses.edsa-project.eu/pluginfile.php/1514/mod_resource/content/0/bitTorrent_part2.htm#:~:text=is%20here.-,creation%20date,-%3A%20%28optional%29%20the%20creation)
   */
  ["creation date"]?: number;
}

/**
 * v1 meta info
 */
export interface MetaInfoV1 extends MetaInfoBase {
  info: Info<"v1">;
}

/**
 * v2 meta info
 */
export interface MetaInfoV2 extends MetaInfoBase {
  info: Info<"v2">;
  ["piece layers"]?: PieceLayers;
}

/**
 * hybrid meta info
 */
export interface MetaInfoHybrid extends MetaInfoBase {
  info: Info<"hybrid">;
  ["piece layers"]?: PieceLayers;
}

/**
 * meta info
 */
export type MetaInfo<T extends TorrentType = TorrentType> = T extends "v1"
  ? MetaInfoV1
  : T extends "v2"
  ? MetaInfoV2
  : T extends "hybrid"
  ? MetaInfoHybrid
  : never;

/**
 * common piece lengths
 */

export const PIECE_LENGTH = {
  "16KB": 1 << 14,
  "32KB": 1 << 15,
  "64KB": 1 << 16,
  "128KB": 1 << 17,
  "256KB": 1 << 18,
  "512KB": 1 << 19,
  "1MB": 1 << 20,
  "2MB": 1 << 21,
  "4MB": 1 << 22,
  "8MB": 1 << 23,
  "16MB": 1 << 24,
  "32MB": 1 << 25,
};

/**
 * default block length 1 << 14 = 16384
 */
export const BLOCK_LENGTH = 1 << 14;

/**
 * default meta version = 2
 */
export const META_VERSION: MetaVersion = 2;

/**
 * default v1 torrent options
 */
const defaultTorrentOptionsV1: InternalTorrentOptions<"v1"> = {
  type: "v1",
  addCreatedBy: true,
  addCreationDate: true,
  addPaddingFiles: false,
  blockLength: BLOCK_LENGTH,
  pieceLength: NaN,
  sortFiles: true,
  isPrivate: false,
};

/**
 * default v2 torrent options
 */
const defaultTorrentOptionsV2: InternalTorrentOptions<"v2"> = {
  type: "v2",
  addCreatedBy: true,
  addCreationDate: true,
  blockLength: BLOCK_LENGTH,
  pieceLength: NaN,
  metaVersion: META_VERSION,
  isPrivate: false,
};

/**
 * default hybrid torrent options
 */
const defaultTorrentOptionsHybrid: InternalTorrentOptions<"hybrid"> = {
  type: "hybrid",
  addCreatedBy: true,
  addCreationDate: true,
  blockLength: BLOCK_LENGTH,
  pieceLength: NaN,
  metaVersion: META_VERSION,
  isPrivate: false,
};

export type OnProgress = (
  current: number,
  total: number
) => void | Promise<void>;

function getTotalPieces(iterableFiles: Iterable<File>, pieceLength: number) {
  let totalPieces = 0;
  for (const file of iterableFiles) {
    totalPieces += Math.ceil(file.size / pieceLength);
  }
  return totalPieces;
}

async function createV1(
  fileDirLikes: FileDirLikes,
  opts: TorrentOptions<"v1">,
  onProgress?: OnProgress
) {
  // assign options
  const iOpts: InternalTorrentOptions<"v1"> = {
    ...defaultTorrentOptionsV1,
    ...opts,
  };
  // build file tree
  const { fileTree, traverseTree, totalFileCount, totalFileSize } =
    await populateFileTree(fileDirLikes, {
      sort: iOpts.sortFiles,
    });
  // early exit
  if (totalFileCount === 0) {
    return;
  }
  // get all files
  const files: File[] = [];
  for (const [, file] of traverseTree(fileTree)) {
    files.push(file);
  }
  // auto calculate piece length
  if (isNaN(iOpts.pieceLength)) {
    // auto calculate piece length if not assigned
    iOpts.pieceLength = calculatePieceLength(totalFileSize, iOpts.blockLength);
  }
  // Piece length is almost always a power of two in v1 torrents
  // https://www.bittorrent.org/beps/bep_0003.html#:~:text=piece%20length%20is%20almost%20always%20a%20power%20of%20two
  if ((iOpts.pieceLength & (iOpts.pieceLength - 1)) !== 0) {
    console.warn(`piece length ${iOpts.pieceLength} is not a power of 2`);
  }
  // collapse announce list
  iOpts.announceList = collapseAnnounceList(iOpts.announceList);
  // auto assign announce if possible
  if (
    typeof iOpts.announce === "undefined" &&
    typeof iOpts.announceList !== "undefined"
  ) {
    iOpts.announce = iOpts.announceList[0]?.[0];
  }
  // sanitize url list
  iOpts.urlList = sanitizeUrlList(iOpts.urlList);
  // progress hook
  const [updateProgress, setProgressTotal] = useProgress(0, onProgress);
  // torrent name and common dir
  const { commonDir, name } = resolveCommonDirAndTorrentName(
    iOpts.name,
    fileTree
  );
  iOpts.name = name;
  // declare v1 piece readable stream
  let v1PiecesAsyncIterable: AsyncIterable<Uint8Array>;
  // add padding files
  if (iOpts.addPaddingFiles) {
    // assign progress total (in piece unit)
    const totalPieces = getTotalPieces(files, iOpts.pieceLength);
    await setProgressTotal(totalPieces);

    const pieceLayerAsyncIterables: AsyncIterable<Uint8Array>[] = [];
    const lastFileIndex = totalFileCount - 1;
    for (let fileIndex = lastFileIndex; fileIndex >= 0; --fileIndex) {
      const file = files[fileIndex] as File;
      pieceLayerAsyncIterables.unshift(
        getPieceLayerAsyncIterable(file.stream(), {
          pieceLength: iOpts.pieceLength,
          padding: fileIndex !== lastFileIndex,
          updateProgress,
        })
      );
      if (fileIndex === lastFileIndex) {
        continue;
      }
      const remainderSize = file.size % iOpts.pieceLength;
      if (remainderSize === 0) {
        continue;
      }
      const paddingSize = iOpts.pieceLength - remainderSize;
      const paddingFile = createPaddingFile(paddingSize, commonDir);
      files.splice(fileIndex + 1, 0, paddingFile);
    }
    v1PiecesAsyncIterable = concatenator(pieceLayerAsyncIterables);
  }
  // no padding files
  else {
    // assign progress total (in piece unit)
    const totalPieces = Math.ceil(totalFileSize / iOpts.pieceLength);
    await setProgressTotal(totalPieces);

    // concatenate all files into a single stream first
    const concatenatedFileAsyncIterable = concatenator(
      files.map((file) => file.stream())
    );
    // and then hash it
    v1PiecesAsyncIterable = getPieceLayerAsyncIterable(
      concatenatedFileAsyncIterable,
      {
        pieceLength: iOpts.pieceLength,
        padding: false,
        updateProgress,
      }
    );
  }

  const metaInfo: MetaInfo<"v1"> = {
    ...(typeof iOpts.announce === "undefined"
      ? {}
      : { announce: iOpts.announce }),
    ...(iOpts.announceList ? { "announce-list": iOpts.announceList } : {}),
    ...(typeof iOpts.comment === "undefined" ? {} : { comment: iOpts.comment }),
    ...(iOpts.addCreatedBy ? { "created by": CREATED_BY } : {}),
    ...(iOpts.addCreationDate
      ? { "creation date": getTimeStampSecondsNow() }
      : {}),
    info: {
      ...(totalFileCount > 1
        ? {
            files: files.map((file) => {
              // get file path segments
              const filePath = (file.webkitRelativePath || file.name).split(
                "/"
              );
              // remove common dir
              commonDir && filePath.shift();
              // emit
              return {
                ...(file.padding ? { attr: "p" as FileAttrs } : {}),
                length: file.size,
                path: filePath,
              };
            }),
          }
        : {
            length: totalFileSize,
          }),
      name: iOpts.name,
      "piece length": iOpts.pieceLength,
      pieces: await new Response(
        fromIterable(v1PiecesAsyncIterable)
      ).arrayBuffer(),
      ...(iOpts.isPrivate ? { private: true } : {}),
      ...(typeof iOpts.source === "undefined" ? {} : { source: iOpts.source }),
    },
    ...(iOpts.urlList ? { "url-list": iOpts.urlList } : {}),
  };

  return metaInfo;
}

async function createV2(
  fileDirLikes: FileDirLikes,
  opts: TorrentOptions<"v2">,
  onProgress?: OnProgress
) {
  // assign options
  const iOpts: InternalTorrentOptions<"v2"> = {
    ...defaultTorrentOptionsV2,
    ...opts,
  };
  // build file tree
  const { fileTree, traverseTree, totalFileCount, totalFileSize } =
    await populateFileTree(fileDirLikes);
  // early exit
  if (totalFileCount === 0) {
    return;
  }
  // get all files
  const files: File[] = [];
  const fileNodeToFileEntries: [FileTreeFileNode, File][] = [];
  for (const [fileNode, file] of traverseTree(fileTree)) {
    files.push(file);
    fileNodeToFileEntries.push([fileNode, file]);
  }
  // auto calculate piece length
  if (isNaN(iOpts.pieceLength)) {
    // auto calculate piece length if not assigned
    iOpts.pieceLength = calculatePieceLength(totalFileSize, iOpts.blockLength);
  }
  // Piece length cannot be smaller than block length in v2 torrents
  // https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=of%20two%20and-,at%20least%2016KiB,-.
  if (iOpts.pieceLength < iOpts.blockLength) {
    throw new Error(
      `piece length ${iOpts.pieceLength} is smaller than block length ${iOpts.blockLength}`
    );
  }
  // Piece length must be a power of two in v2 torrents.
  // https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=It%20must%20be%20a%20power%20of%20two
  if ((iOpts.pieceLength & (iOpts.pieceLength - 1)) !== 0) {
    throw new Error(`piece length ${iOpts.pieceLength} is not a power of 2`);
  }
  // calculate blocks per piece
  const blocksPerPiece = iOpts.pieceLength / iOpts.blockLength;
  // collapse announce list
  iOpts.announceList = collapseAnnounceList(iOpts.announceList);
  // auto assign announce if possible
  if (
    typeof iOpts.announce === "undefined" &&
    typeof iOpts.announceList !== "undefined"
  ) {
    iOpts.announce = iOpts.announceList[0]?.[0];
  }
  // sanitize url list
  iOpts.urlList = sanitizeUrlList(iOpts.urlList);
  // assign progress total (in piece unit)
  const totalPieces = getTotalPieces(files, iOpts.pieceLength);
  // progress hook
  const [updateProgress] = useProgress(totalPieces, onProgress);
  // torrent name
  const { name } = resolveCommonDirAndTorrentName(iOpts.name, fileTree);
  iOpts.name = name;
  // init piece layers
  const pieceLayers: PieceLayers = new Map();
  // populate piece layers and file nodes
  await Promise.all(
    fileNodeToFileEntries.map(async ([fileNode, file]) => {
      await populatePieceLayersAndFileNodes(
        file.stream(),
        pieceLayers,
        fileNode,
        {
          blockLength: iOpts.blockLength,
          pieceLength: iOpts.pieceLength,
          blocksPerPiece,
          updateProgress,
        }
      );
    })
  );

  const metaInfo: MetaInfo<"v2"> = {
    ...(typeof iOpts.announce === "undefined"
      ? {}
      : { announce: iOpts.announce }),
    ...(iOpts.announceList ? { "announce-list": iOpts.announceList } : {}),
    ...(typeof iOpts.comment === "undefined" ? {} : { comment: iOpts.comment }),
    ...(iOpts.addCreatedBy ? { "created by": CREATED_BY } : {}),
    ...(iOpts.addCreationDate
      ? { "creation date": getTimeStampSecondsNow() }
      : {}),
    info: {
      ["file tree"]: fileTree,
      "meta version": iOpts.metaVersion,
      name: iOpts.name,
      "piece length": iOpts.pieceLength,
      // only add private field when it is private
      ...(iOpts.isPrivate ? { private: true } : {}),
      ...(typeof iOpts.source === "undefined" ? {} : { source: iOpts.source }),
    },
    // piece layers must not be abscent
    "piece layers": pieceLayers,
    ...(iOpts.urlList ? { "url-list": iOpts.urlList } : {}),
  };

  return metaInfo;
}

async function createHybrid(
  fileDirLikes: FileDirLikes,
  opts: TorrentOptions<"hybrid">,
  onProgress?: OnProgress
) {
  // assign options
  const iOpts: InternalTorrentOptions<"hybrid"> = {
    ...defaultTorrentOptionsHybrid,
    ...opts,
  };
  // build file tree
  const { fileTree, traverseTree, totalFileCount, totalFileSize } =
    await populateFileTree(fileDirLikes);
  // early exit
  if (totalFileCount === 0) {
    return;
  }
  // get all files
  const files: File[] = [];
  const fileNodeToFileEntries: [FileTreeFileNode, File][] = [];
  for (const [fileNode, file] of traverseTree(fileTree)) {
    files.push(file);
    fileNodeToFileEntries.push([fileNode, file]);
  }
  // auto calculate piece length
  if (isNaN(iOpts.pieceLength)) {
    // auto calculate piece length if not assigned
    iOpts.pieceLength = calculatePieceLength(totalFileSize, iOpts.blockLength);
  }
  // Piece length cannot be smaller than block length in hybrid torrents
  // https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=of%20two%20and-,at%20least%2016KiB,-.
  if (iOpts.pieceLength < iOpts.blockLength) {
    throw new Error(
      `piece length ${iOpts.pieceLength} is smaller than block length ${iOpts.blockLength}`
    );
  }
  // Piece length must be a power of two in hybrid torrents.
  // https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=It%20must%20be%20a%20power%20of%20two
  if ((iOpts.pieceLength & (iOpts.pieceLength - 1)) !== 0) {
    throw new Error(`piece length ${iOpts.pieceLength} is not a power of 2`);
  }
  // calculate blocks per piece
  const blocksPerPiece = iOpts.pieceLength / iOpts.blockLength;
  // collapse announce list
  iOpts.announceList = collapseAnnounceList(iOpts.announceList);
  // auto assign announce if possible
  if (
    typeof iOpts.announce === "undefined" &&
    typeof iOpts.announceList !== "undefined"
  ) {
    iOpts.announce = iOpts.announceList[0]?.[0];
  }
  // sanitize url list
  iOpts.urlList = sanitizeUrlList(iOpts.urlList);
  // progress hook
  const [updateProgress] = useProgress(
    getTotalPieces(files, iOpts.pieceLength) * 2,
    onProgress
  );
  // torrent name
  const { commonDir, name } = resolveCommonDirAndTorrentName(
    iOpts.name,
    fileTree
  );
  iOpts.name = name;
  // init piece layers
  const pieceLayers: PieceLayers = new Map();

  const pieceLayerAsyncIterables: AsyncIterable<Uint8Array>[] = [];
  let lastFileIndex = totalFileCount - 1;
  let fileIndex = -1;
  for (const [fileNode, file] of fileNodeToFileEntries) {
    ++fileIndex;
    // we need to tee one stream into two streams for v1 and v2
    const [v1FileAsyncIterable, v2FileAsyncIterable] = file.stream().tee();
    pieceLayerAsyncIterables.unshift(
      getPieceLayerAsyncIterable(v1FileAsyncIterable, {
        pieceLength: iOpts.pieceLength,
        padding: fileIndex !== lastFileIndex,
        updateProgress,
      })
    );
    // v2
    await populatePieceLayersAndFileNodes(
      v2FileAsyncIterable,
      pieceLayers,
      fileNode,
      {
        blockLength: iOpts.blockLength,
        pieceLength: iOpts.pieceLength,
        blocksPerPiece,
        updateProgress,
      }
    );
    if (fileIndex === lastFileIndex) {
      break;
    }
    const remainderSize = file.size % iOpts.pieceLength;
    if (remainderSize === 0) {
      continue;
    }
    const paddingSize = iOpts.pieceLength - remainderSize;
    const paddingFile = createPaddingFile(paddingSize, commonDir);
    files.splice(++fileIndex, 0, paddingFile);
    ++lastFileIndex;
  }
  const v1PiecesAsyncIterable = concatenator(pieceLayerAsyncIterables);

  const metaInfo: MetaInfo<"hybrid"> = {
    ...(typeof iOpts.announce === "undefined"
      ? {}
      : { announce: iOpts.announce }),
    ...(iOpts.announceList ? { "announce-list": iOpts.announceList } : {}),
    ...(typeof iOpts.comment === "undefined" ? {} : { comment: iOpts.comment }),
    ...(iOpts.addCreatedBy ? { "created by": CREATED_BY } : {}),
    ...(iOpts.addCreationDate
      ? { "creation date": getTimeStampSecondsNow() }
      : {}),
    info: {
      "file tree": fileTree,
      ...(totalFileCount > 1
        ? {
            files: files.map((file) => {
              // get file path segments
              const filePath = (file.webkitRelativePath || file.name).split(
                "/"
              );
              // remove common dir
              commonDir && filePath.shift();
              // emit
              return {
                ...(file.padding ? { attr: "p" as FileAttrs } : {}),
                length: file.size,
                path: filePath,
              };
            }),
          }
        : {
            length: totalFileSize,
          }),
      "meta version": iOpts.metaVersion,
      name: iOpts.name,
      "piece length": iOpts.pieceLength,
      // async iterable to array buffer
      pieces: await new Response(
        fromIterable(v1PiecesAsyncIterable)
      ).arrayBuffer(),
      // only add private field when it is private
      ...(iOpts.isPrivate ? { private: true } : {}),
      ...(typeof iOpts.source === "undefined" ? {} : { source: iOpts.source }),
    },
    // piece layers must not be abscent
    "piece layers": pieceLayers,
    ...(iOpts.urlList ? { "url-list": iOpts.urlList } : {}),
  };

  return metaInfo;
}

export async function create(
  fileDirLikes: FileDirLikes,
  opts: TorrentOptions = { type: "v1" },
  onProgress?: OnProgress
) {
  switch (opts.type) {
    case "v1":
      return await createV1(fileDirLikes, opts, onProgress);
    case "v2":
      return await createV2(fileDirLikes, opts, onProgress);
    case "hybrid":
      return await createHybrid(fileDirLikes, opts, onProgress);
  }
}

/**
 * Populate piece layers and file node in a v2 torrent
 * @param fileAsyncIterable
 * @param pieceLayers
 * @param fileNode
 * @param opts
 */
async function populatePieceLayersAndFileNodes(
  fileAsyncIterable: AsyncIterable<Uint8Array>,
  pieceLayers: PieceLayers,
  fileNode: FileTreeFileNode,
  opts: {
    blockLength: number;
    pieceLength: number;
    blocksPerPiece: number;
    updateProgress?: UpdateProgress;
  }
) {
  // get pieces root and piece layer readable streams
  const { piecesRootAsyncIterable, pieceLayerAsyncIterable } =
    getPiecesRootAndPieceLayerAsyncIterables(fileAsyncIterable, opts);
  // get buffer promise from pieces root
  const piecesRootArrayBufferPromise = new Response(
    fromIterable(piecesRootAsyncIterable)
  ).arrayBuffer();
  // only files that are larger than the piece size have piece layer entries
  // https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=For%20each%20file%20in%20the%20file%20tree%20that%20is%20larger%20than%20the%20piece%20size%20it%20contains%20one%20string%20value
  if (fileNode[""].length > opts.pieceLength) {
    const pieceLayerArrayBufferPromise = new Response(
      fromIterable(pieceLayerAsyncIterable)
    ).arrayBuffer();
    pieceLayers.set(
      await piecesRootArrayBufferPromise,
      await pieceLayerArrayBufferPromise
    );
  }
  // only non-empty files have ["pieces root"] property
  // https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=For-,non%2Dempty,-files%20this%20is
  if (fileNode[""].length > 0) {
    fileNode[""]["pieces root"] = await piecesRootArrayBufferPromise;
  }
}

/**
 * Returns the piece layer of file(s) in a v1 type torrent
 * @param stream file stream as async iterable
 * @param opts options
 * @returns piece layer
 */
function getPieceLayerAsyncIterable(
  stream: AsyncIterable<Uint8Array>,
  {
    pieceLength,
    padding,
    updateProgress,
  }: {
    pieceLength: number;
    padding: boolean;
    updateProgress?: UpdateProgress;
  }
): AsyncIterable<Uint8Array> {
  return chunkHasher(
    chunkRegulator(stream, {
      outputLength: pieceLength,
      padding: padding,
    }),
    { updateProgress: updateProgress }
  );
}

/**
 * Returns the pieces root and piece layer of a file in a v2 type torrent
 * @param asyncIterable
 * @param opts
 * @returns
 */
function getPiecesRootAndPieceLayerAsyncIterables(
  asyncIterable: AsyncIterable<Uint8Array>,
  {
    blockLength,
    blocksPerPiece,
    updateProgress,
  }: {
    blockLength: number;
    blocksPerPiece: number;
    updateProgress?: UpdateProgress;
  }
): {
  piecesRootAsyncIterable: AsyncIterable<Uint8Array>;
  pieceLayerAsyncIterable: AsyncIterable<Uint8Array>;
} {
  const pieceLayerAsyncIterable = merkleRootCalculator(
    chunkPacker(
      chunkHasher(
        chunkRegulator(asyncIterable, { outputLength: blockLength }),
        {
          hashAlgorithm: "SHA-256",
        }
      ),
      { count: blocksPerPiece }
    ),
    {
      updateProgress,
    }
  );

  const [pieceLayerAsyncIterable1, pieceLayerAsyncIterable2] = fromIterable(
    pieceLayerAsyncIterable
  ).tee();

  return {
    piecesRootAsyncIterable: merkleRootCalculator(
      chunkGrouper(pieceLayerAsyncIterable1, {
        paddingMultiplier: blocksPerPiece,
      })
    ),
    pieceLayerAsyncIterable: pieceLayerAsyncIterable2,
  };
}

function createPaddingFile(paddingSize: number, commonDir: string | undefined) {
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
  return paddingFile;
}

export type SetProgressTotal = (
  totalNumberOrFunction:
    | number
    | ((total: number, current?: number) => number | Promise<number>)
) => Promise<void>;

export type UpdateProgress = () => Promise<void>;

function useProgress(
  initTotal: number,
  onProgress?: OnProgress
): [UpdateProgress, SetProgressTotal] {
  // init progress parameters
  const progressRef = {
    // progress current (in piece unit)
    current: 0,
    // progress total (in piece unit)
    total: initTotal,
  };
  // update progress
  const updateProgress: UpdateProgress = async () => {
    if (onProgress) {
      await onProgress(++progressRef.current, progressRef.total);
    }
  };
  // set progress total
  const setProgressTotal: SetProgressTotal = async (totalNumberOrFunction) => {
    if (typeof totalNumberOrFunction === "number") {
      progressRef.total = totalNumberOrFunction;
    } else {
      progressRef.total = await totalNumberOrFunction(
        progressRef.total,
        progressRef.current
      );
    }
  };
  return [updateProgress, setProgressTotal];
}

/**
 * Collapse announce list
 * @param announceList
 * @returns collapsed announce list
 */
function collapseAnnounceList(
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
 * Sanitize url list
 * @param urlList
 * @returns sanitized url list
 */
function sanitizeUrlList(urlList: string[] | undefined): string[] | undefined {
  if (typeof urlList === "undefined") {
    return undefined;
  }
  if (urlList.length === 0) {
    return undefined;
  }
  return urlList;
}

/**
 * Calculate piece length from file size
 * @param fileSize
 * @returns
 */
function calculatePieceLength(fileSize: number, blockLength: number) {
  return Math.max(blockLength, nextPowerOfTwo(fileSize >>> 10));
}
