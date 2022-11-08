import { concatenate as concatenateStreams } from "workbox-streams";

import {
  getSortedIndex,
  collapseAnnounceList,
  getCommonDir,
  padFiles,
  nextPowerOfTwo,
  merkleRoot,
  decideName,
  calculatePieceLength,
} from "./utils.js";

import { BDictionary } from "./encode.js";

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
  type: TorrentType.V1;
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
  type: TorrentType.V2;
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
  type: TorrentType.HYBRID;
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
type FilePropsBase = BDictionary<false> & {
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
};

/**
 * v1 file props
 */
export type FilePropsV1 = FilePropsBase & {
  /**
   * A list of UTF-8 encoded strings
   * corresponding to **subdirectory** names
   *
   * [BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=file%2C%20in%20bytes.-,path,-%2D%20A%20list%20of)
   */
  path: string[];
};

/**
 * v2 file props
 */
export type FilePropsV2 = FilePropsBase & {
  /**
   * For **non-empty** files this is the the root hash
   * of a merkle tree with a branching factor of 2,
   * constructed from 16KiB blocks of the file
   *
   * [BEP 52](https://www.bittorrent.org/beps/bep_0052.html#:~:text=any%20sibling%20entries.-,pieces%20root,-For%20non%2Dempty)
   */
  ["pieces root"]?: ArrayBuffer;
};

/**
 * v1 file list
 */
export type FilesList = FilePropsV1[];

/**
 * v2 file node value
 */
export type FileNodeValue = BDictionary<false> & {
  /**
   * Entries with zero-length keys describe the properties
   * of the composed path at that point
   *
   * [BEP 52](https://www.bittorrent.org/beps/bep_0052.html#:~:text=Entries%20with%20zero%2Dlength%20keys%20describe%20the%20properties%20of%20the%20composed%20path%20at%20that%20point)
   */
  "": FilePropsV2;
};

/**
 * v2 file entry
 */
type FileEntry = [key: string, value: FileNodeValue];

/**
 * v2 dir node value
 */
export type DirNodeValue = BDictionary<false> & {
  [name: string]: DirNodeValue | FileNodeValue;
};

/**
 * v2 dir entry
 */
type DirEntry = [key: string, value: Entries];

/**
 * v2 file or dir entries
 */
type Entries = (FileEntry | DirEntry)[];

/**
 * v2 file node value => file map
 */
type FileNodeMap = WeakMap<FileNodeValue, File>;

/**
 * v2 file tree
 */
export type FileTree = DirNodeValue;

//===================================================================================

/**
 * info base
 */
type InfoBase = BDictionary<false> & {
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
};

/**
 * v1 info base
 */
type InfoV1Base = InfoBase & {
  /**
   * Pieces maps to a string whose length is a multiple of 20
   *
   * [BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=M%20as%20default%29.-,pieces,-maps%20to%20a)
   */
  pieces: ArrayBuffer | string;
};

/**
 * v1 single file info
 */
type InfoV1SingleFile = InfoV1Base & {
  length: number;
};

/**
 * v1 multi file info
 */
type InfoV1MultiFiles = InfoV1Base & {
  files: FilesList;
};

/**
 * v1 info
 */
type InfoV1 = InfoV1SingleFile | InfoV1MultiFiles;

/**
 * v2 info
 */
type InfoV2 = InfoBase & {
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
};

/**
 * hybrid single file info
 */
type InfoHybridSingleFile = InfoV1SingleFile & InfoV2;

/**
 * hybrid multi file info
 */
type InfoHybridMultiFiles = InfoV1MultiFiles & InfoV2;

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
type MetaInfoBase = BDictionary<false> & {
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
};

/**
 * v1 meta info
 */
type MetaInfoV1 = MetaInfoBase & {
  info: Info<TorrentType.V1>;
};

/**
 * v2 meta info
 */
type MetaInfoV2 = MetaInfoBase & {
  info: Info<TorrentType.V2>;
  ["piece layers"]?: PieceLayers;
};

/**
 * hybrid meta info
 */
type MetaInfoHybrid = MetaInfoV2 & {
  info: Info<TorrentType.HYBRID>;
};

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

export enum CommonPieceLength {
  "16KB" = 1 << 14,
  "32KB" = 1 << 15,
  "64KB" = 1 << 16,
  "128KB" = 1 << 17,
  "256KB" = 1 << 18,
  "512KB" = 1 << 19,
  "1MB" = 1 << 20,
  "2MB" = 1 << 21,
  "4MB" = 1 << 22,
  "8MB" = 1 << 23,
  "16MB" = 1 << 24,
  "32MB" = 1 << 25,
}

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
  addPaddingFiles: false,
  blockLength: DEFAULT_BLOCK_LENGTH,
  sortFiles: true,
  isPrivate: false,
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
  isPrivate: false,
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
    isPrivate: false,
  };

export type OnProgress = (
  current: number,
  total: number
) => void | Promise<void>;

/**
 * Create a torrent, returns meta info
 * @param files
 * @param opts
 * @param onProgress
 * @returns
 */
export async function create(
  files: File[],
  opts: TorrentOptions = { type: TorrentType.V1 },
  onProgress?: OnProgress
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

  // init progress parameters
  const progressParams = {
    // progress current (in piece unit)
    current: 0,
    // progress total (in piece unit)
    total: files.reduce((size, file) => {
      return size + Math.ceil(file.size / pieceLength);
    }, 0),
  };

  // update progress
  const updateProgress = () => {
    if (onProgress) {
      onProgress(progressParams.current++, progressParams.total);
    }
  };

  let metaInfo: MetaInfo<TorrentType>;

  // construct meta info
  // v1
  if (iOpts.type === TorrentType.V1) {
    // destruct some options
    const { addPaddingFiles, sortFiles } = iOpts;
    // declare v1 piece readable stream
    let v1PiecesReadableStream: ReadableStream<Uint8Array>;
    // declare common directory
    let commonDir: string | undefined;
    // handle files order
    if (sortFiles) {
      // parse files as file tree, common directory is also parsed
      const {
        sortedFileNodes,
        fileNodeMap,
        commonDir: _commonDir,
      } = parseFileTree(files);
      // reorder files
      files = sortedFileNodes.map(
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
      v1PiecesReadableStream = concatenateStreams(
        files.map(async (file, fileIndex) =>
          getV1PieceLayerReadableStream(file.stream(), {
            pieceLength,
            padding: fileIndex !== lastFileIndex,
            updateProgress,
          })
        )
      ).stream;
      // add paddings to files list
      files = padFiles(files, pieceLength, commonDir);
    } else {
      // reassign progress total (in piece unit)
      progressParams.total = Math.ceil(
        files.reduce((size, file) => {
          return size + file.size;
        }, 0) / pieceLength
      );
      // concatenate all files into a single stream first
      const { stream: concatenatedFileReadableStream } = concatenateStreams(
        files.map((file) => Promise.resolve(file.stream()))
      );
      // and then hash it
      v1PiecesReadableStream = getV1PieceLayerReadableStream(
        concatenatedFileReadableStream,
        {
          pieceLength,
          padding: false,
          updateProgress,
        }
      );
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
        pieces: await new Response(v1PiecesReadableStream).arrayBuffer(),
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
    const { fileTree, sortedFileNodes, fileNodeMap, commonDir } =
      parseFileTree(files);
    // get sorted files
    files = sortedFileNodes.map(
      (fileNode) => fileNodeMap.get(fileNode) as File
    );
    // init piece layers
    const pieceLayers: PieceLayers = new Map();
    // update name
    iOpts.name = name = decideName(name, commonDir, files);
    // bring piece layers into hash work
    await Promise.all(
      sortedFileNodes.map(async (fileNode, index) => {
        const file = files[index];
        await populatePieceLayersAndFileNode(
          file.stream(),
          pieceLayers,
          fileNode,
          {
            blockLength,
            pieceLength,
            blocksPerPiece,
            updateProgress,
          }
        );
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
    const { fileTree, sortedFileNodes, fileNodeMap, commonDir } =
      parseFileTree(files);
    // get sorted files
    files = sortedFileNodes.map(
      (fileNode) => fileNodeMap.get(fileNode) as File
    );
    // init piece layers
    const pieceLayers: PieceLayers = new Map();
    // update name
    iOpts.name = name = decideName(name, commonDir, files);
    // double total in progress because we have v1 and v2 pieces
    progressParams.total *= 2;
    // get last file index
    const lastFileIndex = files.length - 1;
    // declare v1 piece readable stream
    const v1PiecesReadableStreamPromises: Promise<ReadableStream>[] = [];
    // v1 and v2 hash
    await Promise.all(
      sortedFileNodes.map(async (fileNode, index) => {
        // get file
        const file = files[index];
        // we need to tee one stream into two streams for v1 and v2
        const [v1FileStream, v2FileStream] = file.stream().tee();
        // wrap v1 streams to promises for later concatenation
        v1PiecesReadableStreamPromises.push(
          Promise.resolve(
            getV1PieceLayerReadableStream(v1FileStream, {
              pieceLength,
              padding: index !== lastFileIndex,
              updateProgress,
            })
          )
        );
        // v2
        await populatePieceLayersAndFileNode(
          v2FileStream,
          pieceLayers,
          fileNode,
          {
            blockLength,
            pieceLength,
            blocksPerPiece,
            updateProgress,
          }
        );
      })
    );
    // concatenate v1 hash streams
    const v1PiecesReadableStream = concatenateStreams(
      v1PiecesReadableStreamPromises
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
        pieces: await new Response(v1PiecesReadableStream).arrayBuffer(),
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
}

/**
 * Populate piece layers and file node in a v2 torrent
 * @param fileStream
 * @param pieceLayers
 * @param fileNode
 * @param opts
 */
async function populatePieceLayersAndFileNode(
  fileStream: ReadableStream<Uint8Array>,
  pieceLayers: PieceLayers,
  fileNode: FileNodeValue,
  opts: {
    blockLength: number;
    pieceLength: number;
    blocksPerPiece: number;
    updateProgress?: () => void;
  }
) {
  // get pieces root and piece layer readable streams
  const { piecesRootReadableStream, pieceLayerReadableStream } =
    getV2PiecesRootAndPieceLayerReadableStreams(fileStream, opts);
  // get buffer promise from pieces root
  const piecesRootArrayBufferPromise = new Response(
    piecesRootReadableStream
  ).arrayBuffer();
  // only files that are larger than the piece size have piece layer entries
  // https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=For%20each%20file%20in%20the%20file%20tree%20that%20is%20larger%20than%20the%20piece%20size%20it%20contains%20one%20string%20value
  if (fileNode[""].length > opts.pieceLength) {
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
  if (fileNode[""].length > 0) {
    fileNode[""]["pieces root"] = await piecesRootArrayBufferPromise;
  }
}

/**
 * Returns the piece layer of file(s) in a v1 type torrent
 * @param stream file stream
 * @param opts options
 * @returns piece layer
 */
function getV1PieceLayerReadableStream(
  stream: ReadableStream<Uint8Array>,
  opts: {
    pieceLength: number;
    padding: boolean;
    updateProgress?: () => void;
  }
): ReadableStream<Uint8Array> {
  const pieceLayerReadableStream = stream
    .pipeThrough(
      makeChunkSplitter(opts.pieceLength, {
        padding: opts.padding,
      })
    )
    .pipeThrough(makePieceHasher(opts.updateProgress));
  return pieceLayerReadableStream;
}

/**
 * Returns the pieces root and piece layer of a file in a v2 type torrent
 * @param stream
 * @param opts
 * @returns
 */
function getV2PiecesRootAndPieceLayerReadableStreams(
  stream: ReadableStream<Uint8Array>,
  opts: {
    blockLength: number;
    blocksPerPiece: number;
    updateProgress?: () => void;
  }
) {
  const pieceLayerReadableStream: ReadableStream<Uint8Array> = stream
    .pipeThrough(makeChunkSplitter(opts.blockLength))
    .pipeThrough(makeBlockHasher(opts.blocksPerPiece))
    .pipeThrough(makeMerkleRootCalculator(opts.updateProgress));

  const [pl1ReadableStream, pl2ReadableStream] = pieceLayerReadableStream.tee();

  return {
    piecesRootReadableStream: pl2ReadableStream
      .pipeThrough(makeMerkleTreeBalancer(opts.blocksPerPiece))
      .pipeThrough(makeMerkleRootCalculator()),
    pieceLayerReadableStream: pl1ReadableStream,
  };
}

/**
 * Chunk splitter transformer class
 */
class ChunkSplitterTransformer implements Transformer<Uint8Array, Uint8Array> {
  residuePointer = 0;
  chunkLength;
  residue;
  opts;
  constructor(chunkLength: number, opts = { padding: false }) {
    this.chunkLength = chunkLength;
    this.opts = opts;
    this.residue = new Uint8Array(this.chunkLength);
  }
  transform(
    chunk: Uint8Array,
    controller: TransformStreamDefaultController<Uint8Array>
  ) {
    while (this.residuePointer + chunk.byteLength >= this.chunkLength) {
      const chunkEnd = this.chunkLength - this.residuePointer;
      this.residue.set(chunk.subarray(0, chunkEnd), this.residuePointer);
      this.residuePointer = 0;
      controller.enqueue(new Uint8Array(this.residue));
      chunk = chunk.subarray(chunkEnd);
    }
    this.residue.set(chunk, this.residuePointer);
    this.residuePointer += chunk.byteLength;
  }
  flush(controller: TransformStreamDefaultController<Uint8Array>) {
    if (this.residuePointer <= 0) {
      return;
    }
    if (this.opts.padding) {
      this.residue.set(
        new Uint8Array(this.chunkLength - this.residuePointer),
        this.residuePointer
      );
      controller.enqueue(this.residue);
    } else {
      controller.enqueue(this.residue.subarray(0, this.residuePointer));
    }
  }
}

/**
 * Make a chunk splitter transform stream
 * @param chunkLength block length
 * @param opts options
 * @returns chunk splitter transform stream
 */
function makeChunkSplitter(chunkLength: number, opts = { padding: false }) {
  return new TransformStream(new ChunkSplitterTransformer(chunkLength, opts));
}

/**
 * Piece hasher transformer class
 */
class PieceHasherTransformer implements Transformer<Uint8Array, Uint8Array> {
  updateProgress;
  constructor(updateProgress?: () => void) {
    this.updateProgress = updateProgress;
  }
  async transform(
    chunk: Uint8Array,
    controller: TransformStreamDefaultController<Uint8Array>
  ) {
    let pieceHash: Uint8Array;
    try {
      pieceHash = new Uint8Array(await crypto.subtle.digest("SHA-1", chunk));
    } catch {
      const { default: jsSHA1 } = await import("jssha/sha1");
      const sha1Obj = new jsSHA1("SHA-1", "UINT8ARRAY");
      sha1Obj.update(chunk);
      pieceHash = sha1Obj.getHash("UINT8ARRAY");
    }
    controller.enqueue(pieceHash);
    if (this.updateProgress) {
      this.updateProgress();
    }
  }
}

/**
 * Make a piece hasher transform stream
 * @param updateProgress
 * @returns piece hasher transform stream
 */
function makePieceHasher(updateProgress?: () => void) {
  return new TransformStream(new PieceHasherTransformer(updateProgress));
}

/**
 * Block hasher transformer class
 */
class BlockHasherTransformer implements Transformer<Uint8Array, Uint8Array[]> {
  blockCount = 0;
  merkleLeaves: Uint8Array[] = [];
  blocksPerPiece;
  constructor(blocksPerPiece: number) {
    this.blocksPerPiece = blocksPerPiece;
  }
  async transform(
    chunk: Uint8Array,
    controller: TransformStreamDefaultController<Uint8Array[]>
  ) {
    ++this.blockCount;
    let blockHash: Uint8Array;
    try {
      blockHash = new Uint8Array(await crypto.subtle.digest("SHA-256", chunk));
    } catch {
      const { default: jsSHA256 } = await import("jssha/sha256");
      const sha256Obj = new jsSHA256("SHA-256", "UINT8ARRAY");
      sha256Obj.update(chunk);
      blockHash = sha256Obj.getHash("UINT8ARRAY");
    }
    this.merkleLeaves.push(blockHash);
    if (this.merkleLeaves.length === this.blocksPerPiece) {
      controller.enqueue(this.merkleLeaves);
      this.merkleLeaves = [];
    }
  }
  async flush(controller: TransformStreamDefaultController<Uint8Array[]>) {
    if (this.blockCount === 0) {
      return;
    }
    // http://bittorrent.org/beps/bep_0052.html#:~:text=The%20remaining%20leaf%20hashes%20beyond%20the%20end%20of%20the%20file%20required%20to%20construct%20upper%20layers%20of%20the%20merkle%20tree%20are%20set%20to%20zero
    let restBlockCount = 0;
    // If the file is smaller than one piece then the block hashes
    // should be padded to the next power of two instead of the next
    // piece boundary.
    if (this.blockCount < this.blocksPerPiece) {
      restBlockCount = nextPowerOfTwo(this.blockCount) - this.blockCount;
    } else {
      const residue = this.blockCount % this.blocksPerPiece;
      if (residue > 0) {
        restBlockCount = this.blocksPerPiece - residue;
      }
    }
    if (restBlockCount > 0) {
      for (let i = 0; i < restBlockCount; ++i) {
        this.merkleLeaves.push(ZEROS_32_BYTES);
      }
    }
    if (this.merkleLeaves.length > 0) {
      controller.enqueue(this.merkleLeaves);
    }
  }
}

/**
 * Make a block hasher transform stream
 * @param blocksPerPiece
 * @returns block hasher transform stream
 */
function makeBlockHasher(blocksPerPiece: number) {
  return new TransformStream(new BlockHasherTransformer(blocksPerPiece));
}

/**
 * Merkle root calculator transformer class
 */
class MerkleRootCalculatorTransformer
  implements Transformer<Uint8Array[], Uint8Array>
{
  updateProgress;
  constructor(updateProgress?: () => void) {
    this.updateProgress = updateProgress;
  }
  async transform(
    chunk: Uint8Array[],
    controller: TransformStreamDefaultController<Uint8Array>
  ) {
    controller.enqueue(await merkleRoot(chunk));
    if (this.updateProgress) {
      this.updateProgress();
    }
  }
}

/**
 * Make a merkle root calculator transform stream
 * @param updateProgress
 * @returns merkle root calculator transform stream
 */
function makeMerkleRootCalculator(updateProgress?: () => void) {
  return new TransformStream(
    new MerkleRootCalculatorTransformer(updateProgress)
  );
}

/**
 * Merkle tree balancer transformer class
 */
class MerkleTreeBalancerTransformer
  implements Transformer<Uint8Array, Uint8Array[]>
{
  leafCount = 0;
  merkleLeaves: Uint8Array[] = [];
  blocksPerPiece;
  constructor(blocksPerPiece: number) {
    this.blocksPerPiece = blocksPerPiece;
  }
  transform(chunk: Uint8Array) {
    ++this.leafCount;
    this.merkleLeaves.push(chunk);
  }
  async flush(controller: TransformStreamDefaultController<Uint8Array[]>) {
    const restLeafCount = nextPowerOfTwo(this.leafCount) - this.leafCount;
    if (restLeafCount > 0) {
      const padLeaf = await this.padLeafPromise;
      for (let i = 0; i < restLeafCount; ++i) {
        this.merkleLeaves.push(padLeaf);
      }
    }
    controller.enqueue(this.merkleLeaves);
  }
  get padLeafPromise() {
    return merkleRoot(Array(this.blocksPerPiece).fill(new Uint8Array(32)));
  }
}

/**
 * Make a merkle tree balancer transform stream
 * @param blocksPerPiece
 * @returns merkle tree balancer transform stream
 */
function makeMerkleTreeBalancer(blocksPerPiece: number) {
  return new TransformStream(new MerkleTreeBalancerTransformer(blocksPerPiece));
}

/**
 * Parse an array of files into a file tree
 * and return the sorted file nodes
 * @param files an array of files
 * @returns file tree, file node map and common directory
 */
function parseFileTree(files: File[]): {
  fileTree: FileTree;
  sortedFileNodes: FileNodeValue[];
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
    ...(getDirOrFileNode(rootEntries) as DirNodeValue),
  };

  return {
    fileTree,
    sortedFileNodes,
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
