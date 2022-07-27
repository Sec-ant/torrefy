import { concatenate as concatenateStreams } from "workbox-streams";
// @ts-ignore
import { name, version } from "../package.json";
import {
  parseFileTree,
  sanitizeAnnounceList,
  getCommonDir,
  padFiles,
  nextPowerOfTwo,
  merkleRoot,
  setName,
} from "./utils";
import { encode, BObject } from "./bencode";
export const DEFAULT_BLOCK_LENGTH = 1 << 14;
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
export const CREATED_BY = `${name} v${version}`;
const ZEROS_32_BYTES = new Uint8Array(32);
const CURRENT_META_VERSION: MetaVersion = 2;

declare global {
  interface File {
    readonly padding?: boolean;
  }
}

export type MetaVersion = 2;

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
export type Tier = string[];
export type AnnounceList = Tier[];

export interface TorrentOptions {
  addCreatedBy?: boolean;
  addCreationDate?: boolean;
  //addEncoding?: boolean;
  /**
   * add padding files: only available in V1 type
   * files are forcibly padded in HYBRID type
   * and don't need padding in V2 type
   */
  addPaddingFiles?: boolean;
  announce?: string;
  announceList?: AnnounceList;
  /**
   * block length: 16384 (16 KiB) by default
   * do not alter this value
   */
  blockLength?: number;
  comment?: string;
  isPrivate?: boolean;
  metaVersion?: MetaVersion;
  name?: string;
  /**
   * piece length: a power of 2 number
   * will automatically calculate when this value is missing
   */
  pieceLength?: number;
  /**
   * sort file: only available in V1 type
   * files are forcibly sorted in V2 and HYBRID type
   */
  sortFiles?: boolean;
  /**
   * torrent type: V1, V2, HYBRID
   */
  type?: TorrentType;
}

type InternalTorrentOptions = TorrentOptions &
  Required<
    Omit<
      TorrentOptions,
      "announce" | "announceList" | "comment" | "name" | "pieceLength"
    >
  >;

export const defaultTorrentOptions: InternalTorrentOptions = {
  addCreatedBy: true,
  addCreationDate: true,
  // addEncoding: false,
  addPaddingFiles: false,
  announce: undefined,
  announceList: undefined,
  blockLength: DEFAULT_BLOCK_LENGTH,
  comment: undefined,
  isPrivate: true,
  metaVersion: CURRENT_META_VERSION,
  name: undefined,
  pieceLength: undefined,
  sortFiles: true,
  type: TorrentType.V2,
};

type SymlinkAttr = "s";
type ExecutableAttr = "x";
type HiddenAttr = "h";
type PaddingFileAttr = "p";

type Permutations<T extends string, U extends string = T> = T extends any
  ? T | `${T}${Permutations<Exclude<U, T>>}`
  : never;

export type FileAttrs = Permutations<
  SymlinkAttr | ExecutableAttr | HiddenAttr | PaddingFileAttr
>;

export interface FilePropsBase extends BObject {
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

export interface FilePropsV1 extends FilePropsBase {
  /**
   * A list of UTF-8 encoded strings
   * corresponding to **subdirectory** names
   *
   * [BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=file%2C%20in%20bytes.-,path,-%2D%20A%20list%20of)
   */
  path: string[];
}

export interface FilePropsV2 extends FilePropsBase {
  /**
   * For **non-empty** files this is the the root hash
   * of a merkle tree with a branching factor of 2,
   * constructed from 16KiB blocks of the file
   *
   * [BEP 52](https://www.bittorrent.org/beps/bep_0052.html#:~:text=any%20sibling%20entries.-,pieces%20root,-For%20non%2Dempty)
   */
  ["pieces root"]?: ArrayBuffer;
  /**
   * Internal use only
   */
  // file?: File;
}

export type FilesList = FilePropsV1[];

export interface FileNodeValue extends BObject {
  /**
   * Entries with zero-length keys describe the properties
   * of the composed path at that point
   *
   * [BEP 52](https://www.bittorrent.org/beps/bep_0052.html#:~:text=Entries%20with%20zero%2Dlength%20keys%20describe%20the%20properties%20of%20the%20composed%20path%20at%20that%20point)
   */
  "": FilePropsV2;
}

export interface DirNodeValue extends BObject {
  [name: string]: DirNodeValue | FileNodeValue;
}

export interface FileTree extends DirNodeValue, Iterable<FileNodeValue> {}

export type PieceLayers = Map<ArrayBuffer, ArrayBuffer>;

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
  ["announce-list"]?: AnnounceList;
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
  /**
   * The string encoding format used to generate
   * the **pieces** part of the **info** dictionary
   * in the .torrent metafile
   *
   * [BitTorrent Specification](https://courses.edsa-project.eu/pluginfile.php/1514/mod_resource/content/0/bitTorrent_part2.htm#:~:text=the%20.torrent%20%28string%29-,encoding,-%3A%20%28optional%29%20the%20string)
   */
  // encoding?: string;
}

export interface MetaInfo<T extends TorrentType> extends MetaInfoBase {
  info: Info<T>;
  /**
   * A dictionary of strings. For each file in the file tree
   * that is larger than the piece size it contains one string value
   *
   * [BEP 52](https://www.bittorrent.org/beps/bep_0052.html#:~:text=keys%20described%20below.-,piece%20layers,-A%20dictionary%20of)
   */
  ["piece layers"]?: T extends TorrentType.V1 ? never : PieceLayers;
}

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
  private?: 0 | 1;
}

interface InfoV1Base extends InfoBase {
  /**
   * Pieces maps to a string whose length is a multiple of 20
   *
   * [BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=M%20as%20default%29.-,pieces,-maps%20to%20a)
   */
  pieces: ArrayBuffer | string;
}

interface InfoV1SingleFile extends InfoV1Base {
  files?: never;
  length: number;
}

interface InfoV1MultiFiles extends InfoV1Base {
  files: FilesList;
  length?: never;
}

type InfoV1 = InfoV1SingleFile | InfoV1MultiFiles;

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

interface InfoHybridSingleFile extends InfoV1SingleFile, InfoV2 {}

interface InfoHybridMultiFiles extends InfoV1MultiFiles, InfoV2 {}

type InfoHybrid = InfoHybridSingleFile | InfoHybridMultiFiles;

export type Info<T extends TorrentType> = T extends TorrentType.V1
  ? InfoV1
  : T extends TorrentType.V2
  ? InfoV2
  : InfoHybrid;

/**
 * Create a torrent
 * @param files
 * @param opts
 */
export async function create(
  files: File[],
  opts: TorrentOptions = {},
  onProgress: (current: number, total: number) => any = (_, __) => {}
): Promise<{ torrentStream: ReadableStream<Uint8Array>; metaInfo: BObject }> {
  if (files.length === 0) {
    throw new Error("empty file list");
  }

  let {
    addCreatedBy,
    addCreationDate,
    // addEncoding,
    addPaddingFiles,
    announce,
    announceList,
    blockLength,
    comment,
    isPrivate,
    metaVersion,
    name,
    pieceLength = calculatePieceLength(
      files.reduce((sum, file) => sum + file.size, 0)
    ),
    sortFiles,
    type,
  }: InternalTorrentOptions = { ...defaultTorrentOptions, ...opts };

  announceList = sanitizeAnnounceList(announceList);

  if (typeof announce === "undefined" && typeof announceList !== "undefined") {
    announce = announceList[0][0];
  }

  const blocksPerPiece = pieceLength / blockLength;

  // Piece length cannot be smaller than block length
  // in v2 or hybrid torrents
  // https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=of%20two%20and-,at%20least%2016KiB,-.
  if (type !== TorrentType.V1 && pieceLength < blockLength) {
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

  let current = 0;
  let total = files.reduce((size, file) => {
    return size + Math.ceil(file.size / pieceLength);
  }, 0);
  let PAD_LEAF: Uint8Array;

  const metaInfoBase: MetaInfoBase = {
    ...(announce && { announce: announce }),
    ...(announceList && { "announce-list": announceList }),
    ...(comment && { comment: comment }),
    ...(addCreatedBy && { "created by": CREATED_BY }),
    ...(addCreationDate && { "creation date": (Date.now() / 1000) >> 0 }),
  };

  /* Construct Meta Info */
  // v1
  if (type === TorrentType.V1) {
    let v1PieceReadableStream: ReadableStream<Uint8Array>;
    let commonDir: string | undefined;
    if (sortFiles) {
      const { fileTree, fileNodeMap, commonDir: cd } = parseFileTree(files);
      files = [...fileTree].map(
        (fileNode) => fileNodeMap.get(fileNode) as File
      );
      commonDir = cd;
    } else {
      commonDir = getCommonDir(files);
    }
    name = setName(name, commonDir, files);
    if (addPaddingFiles) {
      const lastFileIndex = files.length - 1;
      v1PieceReadableStream = concatenateStreams(
        files.map(async (file, fileIndex) =>
          v1Hash(file.stream(), {
            padding: fileIndex !== lastFileIndex,
          })
        )
      ).stream;
      files = padFiles(files, pieceLength, commonDir);
    } else {
      total = Math.ceil(
        files.reduce((size, file) => {
          return size + file.size;
        }, 0) / pieceLength
      );
      const { stream: concatenatedFileReadableStream } = concatenateStreams(
        files.map((file) => Promise.resolve(file.stream()))
      );
      v1PieceReadableStream = v1Hash(concatenatedFileReadableStream);
    }
    const metaInfo: MetaInfo<TorrentType.V1> = {
      ...metaInfoBase,
      info: {
        ...(files.length > 1
          ? {
              files: files.map((file) => {
                const filePath = (file.webkitRelativePath || file.name).split(
                  "/"
                );
                if (typeof commonDir !== "undefined") {
                  filePath.shift();
                }
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
        pieces: await new Response(v1PieceReadableStream).arrayBuffer(),
        ...(isPrivate && { private: 1 }),
      },
    };
    return {
      torrentStream: encode(metaInfo),
      metaInfo,
    };
  }
  // v2
  else if (type === TorrentType.V2) {
    const { fileTree, fileNodeMap, commonDir } = parseFileTree(files);
    const fileNodes = [...fileTree];
    files = fileNodes.map((fileNode) => fileNodeMap.get(fileNode) as File);
    const pieceLayers: PieceLayers = new Map();
    name = setName(name, commonDir, files);
    await Promise.all(
      fileNodes.map(async (fileNode, index) => {
        const file = files[index];
        await v2Work(fileNode, file, file.stream(), pieceLayers);
      })
    );

    const metaInfo: MetaInfo<TorrentType.V2> = {
      ...metaInfoBase,
      info: {
        ["file tree"]: fileTree,
        "meta version": metaVersion,
        name,
        "piece length": pieceLength,
        ...(isPrivate && { private: 1 }),
      },
      ...(pieceLayers.size > 0 && { "piece layers": pieceLayers }),
    };
    return {
      torrentStream: encode(metaInfo),
      metaInfo,
    };
  }
  // hybrid
  else if (type === TorrentType.HYBRID) {
    const { fileTree, fileNodeMap, commonDir } = parseFileTree(files);
    const fileNodes = [...fileTree];
    files = fileNodes.map((fileNode) => fileNodeMap.get(fileNode) as File);
    const pieceLayers: PieceLayers = new Map();
    name = setName(name, commonDir, files);
    total *= 2;
    const lastFileIndex = files.length - 1;
    const v1PieceReadableStreamPromises: Promise<ReadableStream>[] = [];

    await Promise.all(
      fileNodes.map(async (fileNode, index) => {
        const file = files[index];
        const [v1FileStream, v2FileStream] = file.stream().tee();

        v1PieceReadableStreamPromises.push(
          Promise.resolve(
            v1Hash(v1FileStream, {
              padding: index !== lastFileIndex,
            })
          )
        );

        await v2Work(fileNode, file, v2FileStream, pieceLayers);
      })
    );

    const v1PieceReadableStream = concatenateStreams(
      v1PieceReadableStreamPromises
    ).stream;

    files = padFiles(files, pieceLength, commonDir);

    const metaInfo: MetaInfo<TorrentType.HYBRID> = {
      ...metaInfoBase,
      info: {
        ["file tree"]: fileTree,
        ...(files.length > 1
          ? {
              files: files.map((file) => {
                const filePath = (file.webkitRelativePath || file.name).split(
                  "/"
                );
                if (typeof commonDir !== "undefined") {
                  filePath.shift();
                }
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
        pieces: await new Response(v1PieceReadableStream).arrayBuffer(),
        ...(isPrivate && { private: 1 }),
      },
      ...(pieceLayers.size > 0 && { "piece layers": pieceLayers }),
    };
    return {
      torrentStream: encode(metaInfo),
      metaInfo,
    };
  } else {
    throw new Error(`torrent type ${type} is not supported`);
  }

  async function v2Work(
    fileNode: FileNodeValue,
    file: File,
    fileStream: ReadableStream<Uint8Array>,
    pieceLayers: PieceLayers
  ) {
    // Get pieces root and piece layer readable streams
    const [piecesRootReadableStream, pieceLayerReadableStream] =
      v2Hash(fileStream);
    // Get buffer from pieces root
    const piecesRootArrayBufferPromise = new Response(
      piecesRootReadableStream
    ).arrayBuffer();
    // Only files that are larger than the piece size have piece layer entries
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
    // Only non-empty files have ["pieces root"] property
    // https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=For-,non%2Dempty,-files%20this%20is
    if (file.size > 0) {
      fileNode[""]["pieces root"] = await piecesRootArrayBufferPromise;
    }
  }

  /**
   *
   * @param fileSize
   * @returns
   */
  function calculatePieceLength(fileSize: number) {
    return Math.max(
      opts.blockLength || defaultTorrentOptions.blockLength,
      nextPowerOfTwo(fileSize >>> 10)
    );
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
        makeBlockSplitter(pieceLength, {
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
      .pipeThrough(makeBlockSplitter(blockLength))
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
   *
   * @param blockLength block length
   * @param opts options
   * @returns
   */
  function makeBlockSplitter(
    blockLength: number,
    opts = { padding: false }
  ): TransformStream<Uint8Array, Uint8Array> {
    let residue = new Uint8Array(blockLength);
    let residuePointer = 0;
    return new TransformStream({
      transform: (
        chunk: Uint8Array,
        controller: TransformStreamDefaultController<Uint8Array>
      ) => {
        while (residuePointer + chunk.length >= blockLength) {
          const chunkEnd = blockLength - residuePointer;
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
              new Uint8Array(blockLength - residuePointer),
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
   *
   * @returns
   */
  function makePieceHasher(makeProgress = false) {
    return new TransformStream({
      transform: async (
        chunk: Uint8Array,
        controller: TransformStreamDefaultController<Uint8Array>
      ) => {
        controller.enqueue(
          new Uint8Array(await crypto.subtle.digest("SHA-1", chunk))
        );
        if (makeProgress) {
          onProgress(++current, total);
        }
      },
    });
  }

  /**
   *
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
        const blockHash = new Uint8Array(
          await crypto.subtle.digest("SHA-256", chunk)
        );
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
   *
   * @returns
   */
  function makeMerkleRootCalculator(makeProgress = false) {
    return new TransformStream({
      transform: async (
        chunk: Uint8Array[],
        controller: TransformStreamDefaultController<Uint8Array>
      ) => {
        controller.enqueue(await merkleRoot(chunk));
        if (makeProgress) {
          onProgress(++current, total);
        }
      },
    });
  }

  /**
   *
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
