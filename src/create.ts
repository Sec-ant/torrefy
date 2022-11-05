import { concatenate as concatenateStreams } from "workbox-streams";

import {
  parseFileTree,
  collapseAnnounceList,
  getCommonDir,
  padFiles,
  nextPowerOfTwo,
  merkleRoot,
  decideName,
  calculatePieceLength,
} from "./utils.js";

import { BObject } from "./encode.js";

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
type MetaVersion = 2;

/**
 * torrent type: v1, v2, hybrid
 */
export enum TorrentType {
  /**
   * v1 torrent
   *
   * [BEP 3](https://www.bittorrent.org/beps/bep_0003.html)
   */
  V1 = "v1",
  /**
   * v2 torrent
   *
   * [BEP 52](https://www.bittorrent.org/beps/bep_0052.html)
   */
  V2 = "v2",
  /**
   * v1 + v2 hybrid torrent
   *
   * [BEP 52](https://www.bittorrent.org/beps/bep_0052.html#upgrade-path)
   */
  HYBRID = "hybrid",
}

/**
 * base torrent options
 */
interface TorrentOptionsBase {
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
   * piece length: a power of 2 number
   * will automatically calculate when this value is missing
   */
  pieceLength?: number;
}

/**
 * v1 torrent options
 */
interface TorrentOptionsV1 extends TorrentOptionsBase {
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
  type?: TorrentType.V1;
}

/**
 * v2 torrent options
 */
interface TorrentOptionsV2 extends TorrentOptionsBase {
  /**
   * meta version
   */
  metaVersion?: MetaVersion;
  /**
   * torrent type: V2
   */
  type?: TorrentType.V2;
}

/**
 * v1 + v2 hybrid torrent options
 */
interface TorrentOptionsHybrid extends TorrentOptionsBase {
  /**
   * meta version
   */
  metaVersion?: MetaVersion;
  /**
   * torrent type: HYBRID
   */
  type?: TorrentType.HYBRID;
}

/**
 * torrent options
 */
export type TorrentOptions<T extends TorrentType | undefined = undefined> =
  T extends TorrentType.V1
    ? TorrentOptionsV1
    : T extends TorrentType.V2
    ? TorrentOptionsV2
    : T extends TorrentType.HYBRID
    ? TorrentOptionsHybrid
    : TorrentOptionsV1 | TorrentOptionsV2 | TorrentOptionsHybrid;

/**
 * internal torrent options
 */
type InternalTorrentOptions<T extends TorrentType | undefined = undefined> =
  T extends TorrentType
    ? TorrentOptions<T> &
        Required<
          Omit<
            TorrentOptions<T>,
            "announce" | "announceList" | "comment" | "name" | "pieceLength"
          >
        >
    :
        | InternalTorrentOptions<TorrentType.V1>
        | InternalTorrentOptions<TorrentType.V2>
        | InternalTorrentOptions<TorrentType.HYBRID>;

//===================================================================================

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
type Permutations<T extends string, U extends string = T> = T extends any
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
interface FilePropsBase extends BObject {
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
 * v2 file node value
 */
export interface FileNodeValue extends BObject {
  /**
   * Entries with zero-length keys describe the properties
   * of the composed path at that point
   *
   * [BEP 52](https://www.bittorrent.org/beps/bep_0052.html#:~:text=Entries%20with%20zero%2Dlength%20keys%20describe%20the%20properties%20of%20the%20composed%20path%20at%20that%20point)
   */
  "": FilePropsV2;
}

/**
 * v2 dir node value
 */
export interface DirNodeValue extends BObject {
  [name: string]: DirNodeValue | FileNodeValue;
}

/**
 * v2 file tree
 */
export interface FileTree extends DirNodeValue, Iterable<FileNodeValue> {}

//===================================================================================

/**
 * info base
 */
interface InfoBase extends BObject {
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
  private?: 0 | 1;
}

/**
 * v1 info base
 */
interface InfoV1Base extends InfoBase {
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
interface InfoV1SingleFile extends InfoV1Base {
  length: number;
}

/**
 * v1 multi file info
 */
interface InfoV1MultiFiles extends InfoV1Base {
  files: FilesList;
}

/**
 * v1 info
 */
type InfoV1 = InfoV1SingleFile | InfoV1MultiFiles;

/**
 * v2 info
 */
interface InfoV2 extends InfoBase {
  /**
   * A tree of dictionaries where dictionary keys
   * represent UTF-8 encoded path elements
   *
   * [BEP 52](https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=about%20invalid%20files.-,file%20tree,-A%20tree%20of)
   */
  ["file tree"]: FileTree;
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
interface InfoHybridSingleFile extends InfoV1SingleFile, InfoV2 {}

/**
 * hybrid multi file info
 */
interface InfoHybridMultiFiles extends InfoV1MultiFiles, InfoV2 {}

/**
 * hybrid info
 */
type InfoHybrid = InfoHybridSingleFile | InfoHybridMultiFiles;

/**
 * info
 */
export type Info<T extends TorrentType | undefined = undefined> =
  T extends TorrentType.V1
    ? InfoV1
    : T extends TorrentType.V2
    ? InfoV2
    : T extends TorrentType.HYBRID
    ? InfoHybrid
    : InfoV1 | InfoV2 | InfoHybrid;

//===================================================

/**
 * v2 piece layers
 */
export type PieceLayers = Map<ArrayBuffer, ArrayBuffer>;

/**
 * base meta info
 */
interface MetaInfoBase extends BObject {
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
interface MetaInfoV1 extends MetaInfoBase {
  info: Info<TorrentType.V1>;
}

/**
 * v2 meta info
 */
interface MetaInfoV2 extends MetaInfoBase {
  info: Info<TorrentType.V2>;
  ["piece layers"]?: PieceLayers;
}

/**
 * hybrid meta info
 */
interface MetaInfoHybrid extends MetaInfoV2 {
  info: Info<TorrentType.HYBRID>;
}

/**
 * meta info
 */
export type MetaInfo<T extends TorrentType | undefined = undefined> =
  T extends TorrentType.V1
    ? MetaInfoV1
    : T extends TorrentType.V2
    ? MetaInfoV2
    : T extends TorrentType.HYBRID
    ? MetaInfoHybrid
    : MetaInfoV1 | MetaInfoV2 | MetaInfoHybrid;

/**
 * default block length 1 << 14 = 16384
 */
export const DEFAULT_BLOCK_LENGTH = 1 << 14;

/**
 * common piece lengths
 */
export const COMMON_PIECE_LENGTH = {
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
 * 32-byte-zeros
 */
const ZEROS_32_BYTES = new Uint8Array(32);

/**
 * current meta version = 2
 */
const CURRENT_META_VERSION: MetaVersion = 2;

/**
 * default v1 torrent options
 */
const defaultTorrentOptionsV1: InternalTorrentOptions<TorrentType.V1> = {
  type: TorrentType.V1,
  addCreatedBy: true,
  addCreationDate: true,
  addPaddingFiles: true,
  blockLength: DEFAULT_BLOCK_LENGTH,
  sortFiles: true,
  isPrivate: true,
};

/**
 * default v2 torrent options
 */
const defaultTorrentOptionsV2: InternalTorrentOptions<TorrentType.V2> = {
  type: TorrentType.V2,
  addCreatedBy: true,
  addCreationDate: true,
  blockLength: DEFAULT_BLOCK_LENGTH,
  metaVersion: CURRENT_META_VERSION,
  isPrivate: true,
};

/**
 * default hybrid torrent options
 */
const defaultTorrentOptionsHybrid: InternalTorrentOptions<TorrentType.HYBRID> =
  {
    type: TorrentType.HYBRID,
    addCreatedBy: true,
    addCreationDate: true,
    blockLength: DEFAULT_BLOCK_LENGTH,
    metaVersion: CURRENT_META_VERSION,
    isPrivate: true,
  };

/**
 * Create a torrent, returns meta info
 * @param files
 * @param opts
 * @param onProgress
 * @returns
 */
export async function create(
  files: File[],
  opts: TorrentOptions = {},
  onProgress: (current: number, total: number) => any = (_, __) => {}
): Promise<MetaInfo<TorrentType>> {
  // empty file list will throw error
  if (files.length === 0) {
    throw new Error("empty file list");
  }

  // declare internal torrent options
  let iOpts: InternalTorrentOptions;

  // assign internal torrent options
  switch (opts.type) {
    case TorrentType.V1:
      iOpts = { ...defaultTorrentOptionsV1, ...opts };
      break;
    case TorrentType.V2:
      iOpts = { ...defaultTorrentOptionsV2, ...opts };
      break;
    case TorrentType.HYBRID:
      iOpts = { ...defaultTorrentOptionsHybrid, ...opts };
      break;
    default:
      iOpts = {
        ...defaultTorrentOptionsV1,
        ...opts,
        type: TorrentType.V1,
      };
      break;
  }

  // auto calculate piece length if not assigned
  iOpts.pieceLength ??= calculatePieceLength(
    files.reduce((sum, file) => sum + file.size, 0),
    iOpts.blockLength
  );

  // destruct some internal torrent options
  let {
    addCreatedBy,
    addCreationDate,
    blockLength,
    comment,
    isPrivate,
    name,
    pieceLength,
  } = iOpts;

  // Piece length cannot be smaller than block length
  // in v2 or hybrid torrents
  // https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=of%20two%20and-,at%20least%2016KiB,-.
  if (iOpts.type !== TorrentType.V1 && pieceLength < blockLength) {
    throw new Error(
      `piece length ${pieceLength} is smaller than block length ${blockLength}`
    );
  }

  // Piece length is almost always a power of two in v1 torrents,
  // and must be a power of two in v2 or hybrid torrents.
  // For the sake of clarity and compatibility,
  // a power of two is mandatory
  // https://www.bittorrent.org/beps/bep_0003.html#:~:text=piece%20length%20is%20almost%20always%20a%20power%20of%20two
  // https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=It%20must%20be%20a%20power%20of%20two
  if ((pieceLength & (pieceLength - 1)) !== 0) {
    throw new Error(`piece length ${pieceLength} is not a power of 2`);
  }

  // calculate blocks per piece
  const blocksPerPiece = pieceLength / blockLength;

  // collapse announce list
  iOpts.announceList = collapseAnnounceList(iOpts.announceList);

  // auto assign announce if possible
  if (
    typeof iOpts.announce === "undefined" &&
    typeof iOpts.announceList !== "undefined"
  ) {
    iOpts.announce = iOpts.announceList[0][0];
  }

  // destruct some internal options
  const { announce, announceList } = iOpts;

  // init meta info base
  const metaInfoBase: MetaInfoBase = {
    ...(announce && { announce: announce }),
    ...(announceList && { "announce-list": announceList }),
    ...(comment && { comment: comment }),
    ...(addCreatedBy && { "created by": CREATED_BY }),
    ...(addCreationDate && { "creation date": (Date.now() / 1000) >> 0 }),
  };

  // progress current (in piece unit)
  let current = 0;

  // progress total (in piece unit)
  let total = files.reduce((size, file) => {
    return size + Math.ceil(file.size / pieceLength);
  }, 0);

  let metaInfo: MetaInfo<TorrentType>;
  let PAD_LEAF: Uint8Array;

  // construct meta info
  // v1
  if (iOpts.type === TorrentType.V1) {
    // destruct some options
    const { addPaddingFiles, sortFiles } = iOpts;
    // declare v1 piece readable stream
    let v1PieceReadableStream: ReadableStream<Uint8Array>;
    // declare common directory
    let commonDir: string | undefined;
    // handle files order
    if (sortFiles) {
      // parse files as file tree, common directory is also parsed
      const {
        fileTree,
        fileNodeMap,
        commonDir: _commonDir,
      } = parseFileTree(files);
      // reorder files
      files = [...fileTree].map(
        (fileNode) => fileNodeMap.get(fileNode) as File
      );
      // assign common directory
      commonDir = _commonDir;
    } else {
      // only parse common directory
      commonDir = getCommonDir(files);
    }
    // update name
    iOpts.name = name = decideName(name, commonDir, files);
    // handle padding files
    if (addPaddingFiles) {
      // get last file index
      const lastFileIndex = files.length - 1;
      // hash each file and concatenate them into a single stream
      v1PieceReadableStream = concatenateStreams(
        files.map(async (file, fileIndex) =>
          v1Hash(file.stream(), {
            padding: fileIndex !== lastFileIndex,
          })
        )
      ).stream;
      // add paddings to files list
      files = padFiles(files, pieceLength, commonDir);
    } else {
      // reassign progress total (in piece unit)
      total = Math.ceil(
        files.reduce((size, file) => {
          return size + file.size;
        }, 0) / pieceLength
      );
      // concatenate all files into a single stream first
      const { stream: concatenatedFileReadableStream } = concatenateStreams(
        files.map((file) => Promise.resolve(file.stream()))
      );
      // and then hash it
      v1PieceReadableStream = v1Hash(concatenatedFileReadableStream);
    }
    // populate meta info
    metaInfo = {
      ...metaInfoBase,
      info: {
        ...(files.length > 1
          ? {
              files: files.map((file) => {
                // get file path segments
                const filePath = (file.webkitRelativePath || file.name).split(
                  "/"
                );
                // remove common dir
                if (typeof commonDir !== "undefined") {
                  filePath.shift();
                }
                // emit
                return {
                  ...(file.padding && { attr: "p" }),
                  length: file.size,
                  path: filePath,
                };
              }),
            }
          : {
              length: files[0].size,
            }),
        name,
        "piece length": pieceLength,
        // stream to array buffer
        pieces: await new Response(v1PieceReadableStream).arrayBuffer(),
        // only add private field when it is private
        ...(isPrivate && { private: 1 }),
      },
    } as MetaInfo<TorrentType.V1>;
  }
  // v2
  else if (iOpts.type === TorrentType.V2) {
    // destruct some options
    const { metaVersion } = iOpts;
    // parse files as file tree, common directory is also parsed
    const { fileTree, fileNodeMap, commonDir } = parseFileTree(files);
    // get ordered file nodes
    const fileNodes = [...fileTree];
    // get files from files nodes
    files = fileNodes.map((fileNode) => fileNodeMap.get(fileNode) as File);
    // init piece layers
    const pieceLayers: PieceLayers = new Map();
    // update name
    iOpts.name = name = decideName(name, commonDir, files);
    // bring piece layers into hash work
    await Promise.all(
      fileNodes.map(async (fileNode, index) => {
        const file = files[index];
        await setPieceRootAndLayer(fileNode, file, file.stream(), pieceLayers);
      })
    );
    // populate meta info
    metaInfo = {
      ...metaInfoBase,
      info: {
        ["file tree"]: fileTree,
        "meta version": metaVersion,
        name,
        "piece length": pieceLength,
        // only add private field when it is private
        ...(isPrivate && { private: 1 }),
      },
      // add piece layers if any
      ...(pieceLayers.size > 0 && { "piece layers": pieceLayers }),
    } as MetaInfo<TorrentType.V2>;
  }
  // hybrid
  else if (iOpts.type === TorrentType.HYBRID) {
    // destruct some options
    const { metaVersion } = iOpts;
    // parse files as file tree, common directory is also parsed
    const { fileTree, fileNodeMap, commonDir } = parseFileTree(files);
    // get ordered file nodes
    const fileNodes = [...fileTree];
    // get files from files nodes
    files = fileNodes.map((fileNode) => fileNodeMap.get(fileNode) as File);
    // init piece layers
    const pieceLayers: PieceLayers = new Map();
    // update name
    iOpts.name = name = decideName(name, commonDir, files);
    // double total in progress because we have v1 and v2 pieces
    total *= 2;
    // get last file index
    const lastFileIndex = files.length - 1;
    // declare v1 piece readable stream
    const v1PieceReadableStreamPromises: Promise<ReadableStream>[] = [];
    // v1 and v2 hash
    await Promise.all(
      fileNodes.map(async (fileNode, index) => {
        // get file
        const file = files[index];
        // we need to tee one stream into two streams for v1 and v2
        const [v1FileStream, v2FileStream] = file.stream().tee();
        // wrap v1 streams to promises for later concatenation
        v1PieceReadableStreamPromises.push(
          Promise.resolve(
            v1Hash(v1FileStream, {
              padding: index !== lastFileIndex,
            })
          )
        );
        // v2
        await setPieceRootAndLayer(fileNode, file, v2FileStream, pieceLayers);
      })
    );
    // concatenate v1 hash streams
    const v1PieceReadableStream = concatenateStreams(
      v1PieceReadableStreamPromises
    ).stream;
    // add paddings to files list
    files = padFiles(files, pieceLength, commonDir);
    // populate meta info
    metaInfo = {
      ...metaInfoBase,
      info: {
        ["file tree"]: fileTree,
        ...(files.length > 1
          ? {
              files: files.map((file) => {
                // get file path segments
                const filePath = (file.webkitRelativePath || file.name).split(
                  "/"
                );
                // remove common dir
                if (typeof commonDir !== "undefined") {
                  filePath.shift();
                }
                // emit
                return {
                  ...(file.padding && { attr: "p" }),
                  length: file.size,
                  path: filePath,
                };
              }),
            }
          : {
              length: files[0].size,
            }),
        "meta version": metaVersion,
        name,
        "piece length": pieceLength,
        // stream to array buffer
        pieces: await new Response(v1PieceReadableStream).arrayBuffer(),
        // only add private field when it is private
        ...(isPrivate && { private: 1 }),
      },
      // add piece layers if any
      ...(pieceLayers.size > 0 && { "piece layers": pieceLayers }),
    } as MetaInfo<TorrentType.HYBRID>;
  } else {
    throw new Error(`torrent type is not supported`);
  }

  return metaInfo;

  /**
   * Calculate and set piece root and piece layer in v2 type torrent
   * @param fileNode
   * @param file
   * @param fileStream
   * @param pieceLayers
   */
  async function setPieceRootAndLayer(
    fileNode: FileNodeValue,
    file: File,
    fileStream: ReadableStream<Uint8Array>,
    pieceLayers: PieceLayers
  ) {
    // get pieces root and piece layer readable streams
    const [piecesRootReadableStream, pieceLayerReadableStream] =
      v2Hash(fileStream);
    // get buffer promise from pieces root
    const piecesRootArrayBufferPromise = new Response(
      piecesRootReadableStream
    ).arrayBuffer();
    // only files that are larger than the piece size have piece layer entries
    // https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=For%20each%20file%20in%20the%20file%20tree%20that%20is%20larger%20than%20the%20piece%20size%20it%20contains%20one%20string%20value
    if (file.size > pieceLength) {
      const pieceLayerArrayBufferPromise = new Response(
        pieceLayerReadableStream
      ).arrayBuffer();
      pieceLayers.set(
        await piecesRootArrayBufferPromise,
        await pieceLayerArrayBufferPromise
      );
    }
    // only non-empty files have ["pieces root"] property
    // https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=For-,non%2Dempty,-files%20this%20is
    if (file.size > 0) {
      fileNode[""]["pieces root"] = await piecesRootArrayBufferPromise;
    }
  }
  /**
   * Returns the piece layer of file(s) in a v1 type torrent
   * @param stream file stream
   * @param opts options
   * @returns piece layer
   */
  function v1Hash(
    stream: ReadableStream<Uint8Array>,
    opts = { padding: false }
  ): ReadableStream<Uint8Array> {
    const pieceLayerReadableStream = stream
      .pipeThrough(
        makeChunkSplitter(pieceLength, {
          padding: opts.padding,
        })
      )
      .pipeThrough(makePieceHasher(true));
    return pieceLayerReadableStream;
  }

  /**
   * Returns the pieces root and piece layer of a file in a v2 type torrent
   * @param {ReadableStream<Uint8Array>} stream
   * @returns piece layer
   */
  function v2Hash(
    stream: ReadableStream<Uint8Array>
  ): [
    v2PiecesRootReadableStream: ReadableStream<Uint8Array>,
    v2PieceLayerReadableStream: ReadableStream<Uint8Array>
  ] {
    const pieceLayerReadableStream: ReadableStream<Uint8Array> = stream
      .pipeThrough(makeChunkSplitter(blockLength))
      .pipeThrough(makeBlockHasher())
      .pipeThrough(makeMerkleRootCalculator(true));

    const [pl1ReadableStream, pl2ReadableStream] =
      pieceLayerReadableStream.tee();

    return [
      pl2ReadableStream
        .pipeThrough(makeMerkleTreeBalancer())
        .pipeThrough(makeMerkleRootCalculator()),
      pl1ReadableStream,
    ];
  }

  /**
   * Make a chunk splitter transform stream
   * @param chunkLength block length
   * @param opts options
   * @returns
   */
  function makeChunkSplitter(
    chunkLength: number,
    opts = { padding: false }
  ): TransformStream<Uint8Array, Uint8Array> {
    let residue = new Uint8Array(chunkLength);
    let residuePointer = 0;
    return new TransformStream({
      transform: (
        chunk: Uint8Array,
        controller: TransformStreamDefaultController<Uint8Array>
      ) => {
        while (residuePointer + chunk.length >= chunkLength) {
          const chunkEnd = chunkLength - residuePointer;
          residue.set(chunk.subarray(0, chunkEnd), residuePointer);
          residuePointer = 0;
          controller.enqueue(new Uint8Array(residue));
          chunk = chunk.subarray(chunkEnd);
        }
        residue.set(chunk, residuePointer);
        residuePointer += chunk.length;
      },
      flush: (controller: TransformStreamDefaultController<Uint8Array>) => {
        if (residuePointer > 0) {
          if (opts.padding) {
            residue.set(
              new Uint8Array(chunkLength - residuePointer),
              residuePointer
            );
            controller.enqueue(residue);
          } else {
            controller.enqueue(residue.subarray(0, residuePointer));
          }
        }
      },
    });
  }

  /**
   * Make a piece hasher transform stream
   * @param hookOnProgress
   * @returns
   */
  function makePieceHasher(hookOnProgress = false) {
    return new TransformStream({
      transform: async (
        chunk: Uint8Array,
        controller: TransformStreamDefaultController<Uint8Array>
      ) => {
        let pieceHash: Uint8Array;
        try {
          pieceHash = new Uint8Array(
            await crypto.subtle.digest("SHA-1", chunk)
          );
        } catch {
          const { default: jsSHA1 } = await import("jssha/sha1");
          const sha1Obj = new jsSHA1("SHA-1", "UINT8ARRAY");
          sha1Obj.update(chunk);
          pieceHash = sha1Obj.getHash("UINT8ARRAY");
        }
        controller.enqueue(pieceHash);
        if (hookOnProgress) {
          onProgress(++current, total);
        }
      },
    });
  }

  /**
   * Make a block hasher transform stream
   * @returns
   */
  function makeBlockHasher() {
    let blockCount = 0;
    let merkleLeaves: Uint8Array[] = [];
    return new TransformStream({
      transform: async (
        chunk: Uint8Array,
        controller: TransformStreamDefaultController<Uint8Array[]>
      ) => {
        ++blockCount;
        let blockHash: Uint8Array;
        try {
          blockHash = new Uint8Array(
            await crypto.subtle.digest("SHA-256", chunk)
          );
        } catch {
          const { default: jsSHA256 } = await import("jssha/sha256");
          const sha256Obj = new jsSHA256("SHA-256", "UINT8ARRAY");
          sha256Obj.update(chunk);
          blockHash = sha256Obj.getHash("UINT8ARRAY");
        }
        merkleLeaves.push(blockHash);
        if (merkleLeaves.length === blocksPerPiece) {
          controller.enqueue(merkleLeaves);
          merkleLeaves = [];
        }
      },
      flush: async (
        controller: TransformStreamDefaultController<Uint8Array[]>
      ) => {
        if (blockCount === 0) {
          return;
        }
        // http://bittorrent.org/beps/bep_0052.html#:~:text=The%20remaining%20leaf%20hashes%20beyond%20the%20end%20of%20the%20file%20required%20to%20construct%20upper%20layers%20of%20the%20merkle%20tree%20are%20set%20to%20zero
        let restBlockCount = 0;
        // If the file is smaller than one piece then the block hashes
        // should be padded to the next power of two instead of the next
        // piece boundary.
        if (blockCount < blocksPerPiece) {
          restBlockCount = nextPowerOfTwo(blockCount) - blockCount;
        } else {
          const residue = blockCount % blocksPerPiece;
          if (residue > 0) {
            restBlockCount = blocksPerPiece - residue;
          }
        }
        if (restBlockCount > 0) {
          for (let i = 0; i < restBlockCount; ++i) {
            merkleLeaves.push(ZEROS_32_BYTES);
          }
        }
        if (merkleLeaves.length > 0) {
          controller.enqueue(merkleLeaves);
        }
      },
    });
  }

  /**
   * Make a merkle root calculator transform stream
   * @param hookOnProgress
   * @returns
   */
  function makeMerkleRootCalculator(hookOnProgress = false) {
    return new TransformStream({
      transform: async (
        chunk: Uint8Array[],
        controller: TransformStreamDefaultController<Uint8Array>
      ) => {
        controller.enqueue(await merkleRoot(chunk));
        if (hookOnProgress) {
          onProgress(++current, total);
        }
      },
    });
  }

  /**
   * Make a merkle tree balancer transform stream
   * @returns
   */
  function makeMerkleTreeBalancer() {
    let leafCount = 0;
    let merkleLeaves: Uint8Array[] = [];
    return new TransformStream({
      transform: (chunk: Uint8Array) => {
        ++leafCount;
        merkleLeaves.push(chunk);
      },
      flush: async (
        controller: TransformStreamDefaultController<Uint8Array[]>
      ) => {
        const restLeafCount = nextPowerOfTwo(leafCount) - leafCount;
        if (restLeafCount > 0) {
          PAD_LEAF ??= await merkleRoot(
            Array(blocksPerPiece).fill(new Uint8Array(32))
          );
          for (let i = 0; i < restLeafCount; ++i) {
            merkleLeaves.push(PAD_LEAF);
          }
        }
        controller.enqueue(merkleLeaves);
      },
    });
  }
}
