[torrefy](README.md) / Exports

# torrefy

## Table of contents

### Enumerations

- [CommonPieceLength](enums/CommonPieceLength.md)
- [TokenType](enums/TokenType.md)
- [TorrentType](enums/TorrentType.md)

### Classes

- [BlockHasher](classes/BlockHasher.md)
- [ChunkSplitter](classes/ChunkSplitter.md)
- [MerkleRootCalculator](classes/MerkleRootCalculator.md)
- [MerkleTreeBalancer](classes/MerkleTreeBalancer.md)
- [PieceHasher](classes/PieceHasher.md)
- [Tokenizer](classes/Tokenizer.md)

### Interfaces

- [FilePropsV1](interfaces/FilePropsV1.md)
- [FilePropsV2](interfaces/FilePropsV2.md)
- [FileTreeFileNode](interfaces/FileTreeFileNode.md)

### Type Aliases

- [BByteString](modules.md#bbytestring)
- [BData](modules.md#bdata)
- [BDictionary](modules.md#bdictionary)
- [BInteger](modules.md#binteger)
- [BList](modules.md#blist)
- [BMap](modules.md#bmap)
- [BObject](modules.md#bobject)
- [EncodeHookHandler](modules.md#encodehookhandler)
- [FileAttrs](modules.md#fileattrs)
- [FileDirLike](modules.md#filedirlike)
- [FileDirLikes](modules.md#filedirlikes)
- [FileTreeDirEntry](modules.md#filetreedirentry)
- [FileTreeDirNode](modules.md#filetreedirnode)
- [FileTreeEntries](modules.md#filetreeentries)
- [FileTreeFileEntry](modules.md#filetreefileentry)
- [FilesList](modules.md#fileslist)
- [Info](modules.md#info)
- [MetaInfo](modules.md#metainfo)
- [OnProgress](modules.md#onprogress)
- [PackedFileTreeDirEntry](modules.md#packedfiletreedirentry)
- [PackedFileTreeEntries](modules.md#packedfiletreeentries)
- [PieceLayers](modules.md#piecelayers)
- [PopulateOptions](modules.md#populateoptions)
- [SetProgressTotal](modules.md#setprogresstotal)
- [Token](modules.md#token)
- [TorrentOptions](modules.md#torrentoptions)
- [TraverseTree](modules.md#traversetree)
- [UpdateProgress](modules.md#updateprogress)

### Variables

- [BUFF\_0](modules.md#buff_0)
- [BUFF\_COLON](modules.md#buff_colon)
- [BUFF\_D](modules.md#buff_d)
- [BUFF\_E](modules.md#buff_e)
- [BUFF\_I](modules.md#buff_i)
- [BUFF\_L](modules.md#buff_l)
- [BUFF\_MINUS](modules.md#buff_minus)
- [BYTE\_0](modules.md#byte_0)
- [BYTE\_COLON](modules.md#byte_colon)
- [BYTE\_D](modules.md#byte_d)
- [BYTE\_E](modules.md#byte_e)
- [BYTE\_I](modules.md#byte_i)
- [BYTE\_L](modules.md#byte_l)
- [BYTE\_MINUS](modules.md#byte_minus)
- [DEFAULT\_BLOCK\_LENGTH](modules.md#default_block_length)

### Functions

- [compareEntryNames](modules.md#compareentrynames)
- [concatUint8Arrays](modules.md#concatuint8arrays)
- [create](modules.md#create)
- [decode](modules.md#decode)
- [encode](modules.md#encode)
- [getEntriesOfDirEntry](modules.md#getentriesofdirentry)
- [getFileOfFileEntry](modules.md#getfileoffileentry)
- [getSortedIndex](modules.md#getsortedindex)
- [isDigitByte](modules.md#isdigitbyte)
- [isFile](modules.md#isfile)
- [isFileSystemDirectoryEntry](modules.md#isfilesystemdirectoryentry)
- [isFileSystemDirectoryHandle](modules.md#isfilesystemdirectoryhandle)
- [isFileSystemFileEntry](modules.md#isfilesystemfileentry)
- [isFileSystemFileHandle](modules.md#isfilesystemfilehandle)
- [isFileTreeDirEntry](modules.md#isfiletreedirentry)
- [isFileTreeDirNode](modules.md#isfiletreedirnode)
- [isFileTreeFileEntry](modules.md#isfiletreefileentry)
- [isFileTreeFileNode](modules.md#isfiletreefilenode)
- [iterableSort](modules.md#iterablesort)
- [merkleRoot](modules.md#merkleroot)
- [nextPowerOfTwo](modules.md#nextpoweroftwo)
- [packEntriesToDirNode](modules.md#packentriestodirnode)
- [parse](modules.md#parse)
- [populateFileTree](modules.md#populatefiletree)
- [resolveCommonDirAndTorrentName](modules.md#resolvecommondirandtorrentname)
- [useArrayBufferPromiseHook](modules.md#usearraybufferpromisehook)
- [useTextPromiseHook](modules.md#usetextpromisehook)
- [useUint8ArrayStreamHook](modules.md#useuint8arraystreamhook)

## Type Aliases

### BByteString

Ƭ **BByteString**<`Strict`\>: `Strict` extends ``true`` ? `BByteStringStrict` : `BByteStringLoose`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Strict` | extends `boolean` = ``true`` |

#### Defined in

[src/utils/codec.ts:11](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L11)

___

### BData

Ƭ **BData**<`Strict`\>: `Strict` extends ``true`` ? `BDataStrict` : `BDataLoose`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Strict` | extends `boolean` = ``true`` |

#### Defined in

[src/utils/codec.ts:53](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L53)

___

### BDictionary

Ƭ **BDictionary**<`Strict`\>: `Strict` extends ``true`` ? `BDictionaryStrict` : `BDictionaryLoose`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Strict` | extends `boolean` = ``true`` |

#### Defined in

[src/utils/codec.ts:36](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L36)

___

### BInteger

Ƭ **BInteger**<`Strict`\>: `Strict` extends ``true`` ? `BIntegerStrict` : `BIntegerLoose`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Strict` | extends `boolean` = ``true`` |

#### Defined in

[src/utils/codec.ts:4](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L4)

___

### BList

Ƭ **BList**<`Strict`\>: `Strict` extends ``true`` ? `BListStrict` : `BListLoose`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Strict` | extends `boolean` = ``true`` |

#### Defined in

[src/utils/codec.ts:18](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L18)

___

### BMap

Ƭ **BMap**: `Map`<[`BByteString`](modules.md#bbytestring)<``false``\>, [`BData`](modules.md#bdata)<``false``\>\>

#### Defined in

[src/utils/codec.ts:32](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L32)

___

### BObject

Ƭ **BObject**<`Strict`\>: `Strict` extends ``true`` ? `BObjectStrict` : `BObjectLoose`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Strict` | extends `boolean` = ``true`` |

#### Defined in

[src/utils/codec.ts:29](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L29)

___

### EncodeHookHandler

Ƭ **EncodeHookHandler**: (`result`: `IteratorResult`<`Uint8Array`, `undefined`\>) => `void`

#### Type declaration

▸ (`result`): `void`

encode hook handler

##### Parameters

| Name | Type |
| :------ | :------ |
| `result` | `IteratorResult`<`Uint8Array`, `undefined`\> |

##### Returns

`void`

#### Defined in

[src/encode.ts:8](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/encode.ts#L8)

___

### FileAttrs

Ƭ **FileAttrs**: `Permutations`<`SymlinkAttr` \| `ExecutableAttr` \| `HiddenAttr` \| `PaddingFileAttr`\>

file attributes

#### Defined in

[src/utils/fileTree.ts:48](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileTree.ts#L48)

___

### FileDirLike

Ƭ **FileDirLike**: `FileSystemHandle` \| `FileSystemEntry` \| `File`

#### Defined in

[src/utils/fileDirLike.ts:1](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileDirLike.ts#L1)

___

### FileDirLikes

Ƭ **FileDirLikes**: `Iterable`<[`FileDirLike`](modules.md#filedirlike)\> \| `AsyncIterable`<[`FileDirLike`](modules.md#filedirlike)\>

#### Defined in

[src/utils/fileDirLike.ts:3](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileDirLike.ts#L3)

___

### FileTreeDirEntry

Ƭ **FileTreeDirEntry**: [dirname: string, value: FileTreeEntries]

v2 dir entry

#### Defined in

[src/utils/fileTree.ts:136](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileTree.ts#L136)

___

### FileTreeDirNode

Ƭ **FileTreeDirNode**: `Map`<`string`, [`FileTreeDirNode`](modules.md#filetreedirnode) \| [`FileTreeFileNode`](interfaces/FileTreeFileNode.md)\>

v2 file tree dir node

#### Defined in

[src/utils/fileTree.ts:131](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileTree.ts#L131)

___

### FileTreeEntries

Ƭ **FileTreeEntries**: ([`FileTreeFileEntry`](modules.md#filetreefileentry) \| [`FileTreeDirEntry`](modules.md#filetreedirentry))[]

v2 file or dir entries

#### Defined in

[src/utils/fileTree.ts:146](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileTree.ts#L146)

___

### FileTreeFileEntry

Ƭ **FileTreeFileEntry**: [filename: string, value: FileTreeFileNode]

v2 file entry

#### Defined in

[src/utils/fileTree.ts:126](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileTree.ts#L126)

___

### FilesList

Ƭ **FilesList**: [`FilePropsV1`](interfaces/FilePropsV1.md)[]

v1 file list

#### Defined in

[src/utils/fileTree.ts:108](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileTree.ts#L108)

___

### Info

Ƭ **Info**<`T`\>: `T` extends [`V1`](enums/TorrentType.md#v1) ? `InfoV1` : `T` extends [`V2`](enums/TorrentType.md#v2) ? `InfoV2` : `T` extends [`HYBRID`](enums/TorrentType.md#hybrid) ? `InfoHybrid` : `never`

info

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`TorrentType`](enums/TorrentType.md) = [`TorrentType`](enums/TorrentType.md) |

#### Defined in

[src/create.ts:295](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/create.ts#L295)

___

### MetaInfo

Ƭ **MetaInfo**<`T`\>: `T` extends [`V1`](enums/TorrentType.md#v1) ? `MetaInfoV1` : `T` extends [`V2`](enums/TorrentType.md#v2) ? `MetaInfoV2` : `T` extends [`HYBRID`](enums/TorrentType.md#hybrid) ? `MetaInfoHybrid` : `never`

meta info

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`TorrentType`](enums/TorrentType.md) = [`TorrentType`](enums/TorrentType.md) |

#### Defined in

[src/create.ts:376](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/create.ts#L376)

___

### OnProgress

Ƭ **OnProgress**: (`current`: `number`, `total`: `number`) => `void` \| `Promise`<`void`\>

#### Type declaration

▸ (`current`, `total`): `void` \| `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `current` | `number` |
| `total` | `number` |

##### Returns

`void` \| `Promise`<`void`\>

#### Defined in

[src/create.ts:455](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/create.ts#L455)

___

### PackedFileTreeDirEntry

Ƭ **PackedFileTreeDirEntry**: [dirname: string, value: FileTreeDirNode]

v2 packed dir entry

#### Defined in

[src/utils/fileTree.ts:141](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileTree.ts#L141)

___

### PackedFileTreeEntries

Ƭ **PackedFileTreeEntries**: ([`FileTreeFileEntry`](modules.md#filetreefileentry) \| [`PackedFileTreeDirEntry`](modules.md#packedfiletreedirentry))[]

v2 packed file or dir entries

#### Defined in

[src/utils/fileTree.ts:151](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileTree.ts#L151)

___

### PieceLayers

Ƭ **PieceLayers**: `Map`<`ArrayBuffer`, `ArrayBuffer`\>

v2 piece layers

#### Defined in

[src/create.ts:308](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/create.ts#L308)

___

### PopulateOptions

Ƭ **PopulateOptions**: { `compareFunction?`: `never` ; `polyfillWebkitRelativePath?`: `boolean` ; `sort?`: ``false``  } \| { `compareFunction?`: (`entry`: [`FileTreeFileEntry`](modules.md#filetreefileentry) \| [`FileTreeDirEntry`](modules.md#filetreedirentry), `name`: `string`) => `number` ; `polyfillWebkitRelativePath?`: `boolean` ; `sort?`: ``true``  }

#### Defined in

[src/utils/fileTree.ts:184](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileTree.ts#L184)

___

### SetProgressTotal

Ƭ **SetProgressTotal**: (`totalNumberOrFunction`: `number` \| (`total`: `number`, `current?`: `number`) => `number` \| `Promise`<`number`\>) => `Promise`<`void`\>

#### Type declaration

▸ (`totalNumberOrFunction`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `totalNumberOrFunction` | `number` \| (`total`: `number`, `current?`: `number`) => `number` \| `Promise`<`number`\> |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/create.ts:1024](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/create.ts#L1024)

___

### Token

Ƭ **Token**<`T`\>: `T` extends [`Integer`](enums/TokenType.md#integer) ? `IntegerToken` : `T` extends [`ByteString`](enums/TokenType.md#bytestring) ? `ByteStringToken` : `T` extends [`ListStart`](enums/TokenType.md#liststart) ? `ListStartToken` : `T` extends [`ListEnd`](enums/TokenType.md#listend) ? `ListEndToken` : `T` extends [`DictionaryStart`](enums/TokenType.md#dictionarystart) ? `DictionaryStartToken` : `T` extends [`DictionaryEnd`](enums/TokenType.md#dictionaryend) ? `DictionaryEndToken` : `never`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`TokenType`](enums/TokenType.md) = [`TokenType`](enums/TokenType.md) |

#### Defined in

[src/transformers/tokenizer.ts:48](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/transformers/tokenizer.ts#L48)

___

### TorrentOptions

Ƭ **TorrentOptions**<`T`\>: `T` extends [`V1`](enums/TorrentType.md#v1) ? `TorrentOptionsV1` : `T` extends [`V2`](enums/TorrentType.md#v2) ? `TorrentOptionsV2` : `T` extends [`HYBRID`](enums/TorrentType.md#hybrid) ? `TorrentOptionsHybrid` : `never`

torrent options

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`TorrentType`](enums/TorrentType.md) = [`TorrentType`](enums/TorrentType.md) |

#### Defined in

[src/create.ts:161](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/create.ts#L161)

___

### TraverseTree

Ƭ **TraverseTree**: (`node`: [`FileTreeDirNode`](modules.md#filetreedirnode) \| [`FileTreeFileNode`](interfaces/FileTreeFileNode.md)) => `Generator`<[[`FileTreeFileNode`](interfaces/FileTreeFileNode.md), `File`], `void`, `unknown`\>

#### Type declaration

▸ (`node`): `Generator`<[[`FileTreeFileNode`](interfaces/FileTreeFileNode.md), `File`], `void`, `unknown`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`FileTreeDirNode`](modules.md#filetreedirnode) \| [`FileTreeFileNode`](interfaces/FileTreeFileNode.md) |

##### Returns

`Generator`<[[`FileTreeFileNode`](interfaces/FileTreeFileNode.md), `File`], `void`, `unknown`\>

#### Defined in

[src/utils/fileTree.ts:199](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileTree.ts#L199)

___

### UpdateProgress

Ƭ **UpdateProgress**: () => `Promise`<`void`\>

#### Type declaration

▸ (): `Promise`<`void`\>

##### Returns

`Promise`<`void`\>

#### Defined in

[src/create.ts:1030](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/create.ts#L1030)

## Variables

### BUFF\_0

• `Const` **BUFF\_0**: `Uint8Array`

bencode buff: 0 (stands for 0)

#### Defined in

[src/utils/codec.ts:125](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L125)

___

### BUFF\_COLON

• `Const` **BUFF\_COLON**: `Uint8Array`

bencode buff: : (stands for byte string length end)

#### Defined in

[src/utils/codec.ts:105](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L105)

___

### BUFF\_D

• `Const` **BUFF\_D**: `Uint8Array`

bencode buff: d (stands for dictionary start)

#### Defined in

[src/utils/codec.ts:75](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L75)

___

### BUFF\_E

• `Const` **BUFF\_E**: `Uint8Array`

bencode buff: e (stands for end)

#### Defined in

[src/utils/codec.ts:85](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L85)

___

### BUFF\_I

• `Const` **BUFF\_I**: `Uint8Array`

bencode buff: i (stands for integer start)

#### Defined in

[src/utils/codec.ts:95](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L95)

___

### BUFF\_L

• `Const` **BUFF\_L**: `Uint8Array`

bencode buff: l (stands for list start)

#### Defined in

[src/utils/codec.ts:65](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L65)

___

### BUFF\_MINUS

• `Const` **BUFF\_MINUS**: `Uint8Array`

bencode buff: - (stands for -)

#### Defined in

[src/utils/codec.ts:115](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L115)

___

### BYTE\_0

• `Const` **BYTE\_0**: ``48``

bencode byte: 0 (stands for 0)

#### Defined in

[src/utils/codec.ts:120](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L120)

___

### BYTE\_COLON

• `Const` **BYTE\_COLON**: ``58``

bencode byte: : (stands for byte string length end)

#### Defined in

[src/utils/codec.ts:100](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L100)

___

### BYTE\_D

• `Const` **BYTE\_D**: ``100``

bencode byte: d (stands for dictionary start)

#### Defined in

[src/utils/codec.ts:70](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L70)

___

### BYTE\_E

• `Const` **BYTE\_E**: ``101``

bencode byte: e (stands for end)

#### Defined in

[src/utils/codec.ts:80](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L80)

___

### BYTE\_I

• `Const` **BYTE\_I**: ``105``

bencode byte: i (stands for integer start)

#### Defined in

[src/utils/codec.ts:90](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L90)

___

### BYTE\_L

• `Const` **BYTE\_L**: ``108``

bencode byte: l (stands for list start)

#### Defined in

[src/utils/codec.ts:60](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L60)

___

### BYTE\_MINUS

• `Const` **BYTE\_MINUS**: ``45``

bencode byte: - (stands for -)

#### Defined in

[src/utils/codec.ts:110](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L110)

___

### DEFAULT\_BLOCK\_LENGTH

• `Const` **DEFAULT\_BLOCK\_LENGTH**: `number`

default block length 1 << 14 = 16384

#### Defined in

[src/create.ts:388](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/create.ts#L388)

## Functions

### compareEntryNames

▸ **compareEntryNames**(`entry`, `name`): ``0`` \| ``1`` \| ``-1``

#### Parameters

| Name | Type |
| :------ | :------ |
| `entry` | [`FileTreeFileEntry`](modules.md#filetreefileentry) \| [`FileTreeDirEntry`](modules.md#filetreedirentry) |
| `name` | `string` |

#### Returns

``0`` \| ``1`` \| ``-1``

#### Defined in

[src/utils/fileTree.ts:506](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileTree.ts#L506)

___

### concatUint8Arrays

▸ **concatUint8Arrays**(...`uint8Arrays`): `Uint8Array`

concat uint8 arrays

#### Parameters

| Name | Type |
| :------ | :------ |
| `...uint8Arrays` | `Uint8Array`[] |

#### Returns

`Uint8Array`

#### Defined in

[src/utils/misc.ts:61](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/misc.ts#L61)

___

### create

▸ **create**(`fileDirLikes`, `opts?`, `onProgress?`): `Promise`<`undefined` \| `MetaInfoV1` \| `MetaInfoV2`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fileDirLikes` | [`FileDirLikes`](modules.md#filedirlikes) |
| `opts` | `TorrentOptionsV1` \| `TorrentOptionsV2` \| `TorrentOptionsHybrid` |
| `onProgress?` | [`OnProgress`](modules.md#onprogress) |

#### Returns

`Promise`<`undefined` \| `MetaInfoV1` \| `MetaInfoV2`\>

#### Defined in

[src/create.ts:885](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/create.ts#L885)

___

### decode

▸ **decode**(`torrentReadableStream`): `Promise`<[`BData`](modules.md#bdata) \| `undefined`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `torrentReadableStream` | `ReadableStream`<`Uint8Array`\> |

#### Returns

`Promise`<[`BData`](modules.md#bdata) \| `undefined`\>

#### Defined in

[src/decode.ts:130](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/decode.ts#L130)

___

### encode

▸ **encode**(`data`, `hooks?`): `ReadableStream`<`Uint8Array`\>

BEncode

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `BDataLoose` |
| `hooks?` | `EncoderHooks` |

#### Returns

`ReadableStream`<`Uint8Array`\>

readable stream of the bencoded data

#### Defined in

[src/encode.ts:192](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/encode.ts#L192)

___

### getEntriesOfDirEntry

▸ **getEntriesOfDirEntry**(`dirEntry`): `AsyncGenerator`<`FileSystemEntry`, `void`, `unknown`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `dirEntry` | `FileSystemDirectoryEntry` |

#### Returns

`AsyncGenerator`<`FileSystemEntry`, `void`, `unknown`\>

#### Defined in

[src/utils/fileDirLike.ts:69](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileDirLike.ts#L69)

___

### getFileOfFileEntry

▸ **getFileOfFileEntry**(`fileSystemFileEntry`): `Promise`<`File`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fileSystemFileEntry` | `FileSystemFileEntry` |

#### Returns

`Promise`<`File`\>

#### Defined in

[src/utils/fileDirLike.ts:82](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileDirLike.ts#L82)

___

### getSortedIndex

▸ **getSortedIndex**<`T`, `V`\>(`array`, `value`, `compareFunction`): `Object`

A helper function to determine the index
of a new value in an existed sorted array

#### Type parameters

| Name |
| :------ |
| `T` |
| `V` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `array` | `T`[] | an existed sorted array |
| `value` | `V` | the new value whose index is to be determined |
| `compareFunction` | (`a`: `T`, `b`: `V`) => `number` | a compare function to determine the order, like the one in Array.prototype.sort() |

#### Returns

`Object`

index of the value in the sorted array and indexed result if found

| Name | Type |
| :------ | :------ |
| `index` | `number` |
| `result` | `undefined` \| `T` |

#### Defined in

[src/utils/misc.ts:9](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/misc.ts#L9)

___

### isDigitByte

▸ **isDigitByte**(`byte`): `boolean`

is byte digit

#### Parameters

| Name | Type |
| :------ | :------ |
| `byte` | `number` |

#### Returns

`boolean`

#### Defined in

[src/utils/codec.ts:132](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/codec.ts#L132)

___

### isFile

▸ **isFile**(`fileDirLike`): fileDirLike is File

#### Parameters

| Name | Type |
| :------ | :------ |
| `fileDirLike` | [`FileDirLike`](modules.md#filedirlike) |

#### Returns

fileDirLike is File

#### Defined in

[src/utils/fileDirLike.ts:5](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileDirLike.ts#L5)

___

### isFileSystemDirectoryEntry

▸ **isFileSystemDirectoryEntry**(`fileDirLike`): fileDirLike is FileSystemDirectoryEntry

#### Parameters

| Name | Type |
| :------ | :------ |
| `fileDirLike` | [`FileDirLike`](modules.md#filedirlike) |

#### Returns

fileDirLike is FileSystemDirectoryEntry

#### Defined in

[src/utils/fileDirLike.ts:9](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileDirLike.ts#L9)

___

### isFileSystemDirectoryHandle

▸ **isFileSystemDirectoryHandle**(`fileDirLike`): fileDirLike is FileSystemDirectoryHandle

#### Parameters

| Name | Type |
| :------ | :------ |
| `fileDirLike` | [`FileDirLike`](modules.md#filedirlike) |

#### Returns

fileDirLike is FileSystemDirectoryHandle

#### Defined in

[src/utils/fileDirLike.ts:29](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileDirLike.ts#L29)

___

### isFileSystemFileEntry

▸ **isFileSystemFileEntry**(`fileDirLike`): fileDirLike is FileSystemFileEntry

#### Parameters

| Name | Type |
| :------ | :------ |
| `fileDirLike` | [`FileDirLike`](modules.md#filedirlike) |

#### Returns

fileDirLike is FileSystemFileEntry

#### Defined in

[src/utils/fileDirLike.ts:19](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileDirLike.ts#L19)

___

### isFileSystemFileHandle

▸ **isFileSystemFileHandle**(`fileDirLike`): fileDirLike is FileSystemFileHandle

#### Parameters

| Name | Type |
| :------ | :------ |
| `fileDirLike` | [`FileDirLike`](modules.md#filedirlike) |

#### Returns

fileDirLike is FileSystemFileHandle

#### Defined in

[src/utils/fileDirLike.ts:45](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileDirLike.ts#L45)

___

### isFileTreeDirEntry

▸ **isFileTreeDirEntry**(`entry`): entry is FileTreeDirEntry

#### Parameters

| Name | Type |
| :------ | :------ |
| `entry` | `undefined` \| [`FileTreeFileEntry`](modules.md#filetreefileentry) \| [`FileTreeDirEntry`](modules.md#filetreedirentry) |

#### Returns

entry is FileTreeDirEntry

#### Defined in

[src/utils/fileTree.ts:499](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileTree.ts#L499)

___

### isFileTreeDirNode

▸ **isFileTreeDirNode**(`node`): node is FileTreeDirNode

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | `undefined` \| [`FileTreeFileNode`](interfaces/FileTreeFileNode.md) \| [`FileTreeDirNode`](modules.md#filetreedirnode) |

#### Returns

node is FileTreeDirNode

#### Defined in

[src/utils/fileTree.ts:487](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileTree.ts#L487)

___

### isFileTreeFileEntry

▸ **isFileTreeFileEntry**(`entry`): entry is FileTreeFileEntry

#### Parameters

| Name | Type |
| :------ | :------ |
| `entry` | `undefined` \| [`FileTreeFileEntry`](modules.md#filetreefileentry) \| [`FileTreeDirEntry`](modules.md#filetreedirentry) |

#### Returns

entry is FileTreeFileEntry

#### Defined in

[src/utils/fileTree.ts:493](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileTree.ts#L493)

___

### isFileTreeFileNode

▸ **isFileTreeFileNode**(`node`): node is FileTreeFileNode

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | `undefined` \| [`FileTreeFileNode`](interfaces/FileTreeFileNode.md) \| [`FileTreeDirNode`](modules.md#filetreedirnode) |

#### Returns

node is FileTreeFileNode

#### Defined in

[src/utils/fileTree.ts:481](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileTree.ts#L481)

___

### iterableSort

▸ **iterableSort**<`T`\>(`iterable`, `compareFunction`): `T`[]

Sort iterable into a sorted array

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `iterable` | `IterableIterator`<`T`\> |
| `compareFunction` | (`a`: `T`, `b`: `T`) => `number` |

#### Returns

`T`[]

sorted array

#### Defined in

[src/utils/misc.ts:44](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/misc.ts#L44)

___

### merkleRoot

▸ **merkleRoot**(`leaves`): `Promise`<`Uint8Array`\>

Calculate the root hash of the merkle tree
constructed by given leaves

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `leaves` | `Uint8Array`[] | merkle leaves |

#### Returns

`Promise`<`Uint8Array`\>

root hash

#### Defined in

[src/utils/misc.ts:90](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/misc.ts#L90)

___

### nextPowerOfTwo

▸ **nextPowerOfTwo**(`number`): `number`

Calculate the next nearest power of 2

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `number` | `number` | number |

#### Returns

`number`

next nearest power of 2

#### Defined in

[src/utils/misc.ts:80](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/misc.ts#L80)

___

### packEntriesToDirNode

▸ **packEntriesToDirNode**(`entries`, `shouldDeepPack?`): [`FileTreeDirNode`](modules.md#filetreedirnode)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `entries` | [`FileTreeEntries`](modules.md#filetreeentries) \| [`PackedFileTreeEntries`](modules.md#packedfiletreeentries) | `undefined` |
| `shouldDeepPack` | `boolean` | `false` |

#### Returns

[`FileTreeDirNode`](modules.md#filetreedirnode)

#### Defined in

[src/utils/fileTree.ts:456](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileTree.ts#L456)

___

### parse

▸ **parse**(`tokenReadableStream`): `Promise`<[`BData`](modules.md#bdata) \| `undefined`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `tokenReadableStream` | `ReadableStream`<`IntegerToken` \| `ByteStringToken` \| `ListStartToken` \| `ListEndToken` \| `DictionaryStartToken` \| `DictionaryEndToken`\> |

#### Returns

`Promise`<[`BData`](modules.md#bdata) \| `undefined`\>

#### Defined in

[src/decode.ts:11](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/decode.ts#L11)

___

### populateFileTree

▸ **populateFileTree**(`fileDirLikes`, `opts?`): `Promise`<{ `fileTree`: [`FileTreeDirNode`](modules.md#filetreedirnode) ; `totalFileCount`: `number` ; `totalFileSize`: `number` ; `traverseTree`: [`TraverseTree`](modules.md#traversetree)  }\>

Parse file-dir-likes into a file tree

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fileDirLikes` | [`FileDirLikes`](modules.md#filedirlikes) |  |
| `opts` | [`PopulateOptions`](modules.md#populateoptions) | populate options |

#### Returns

`Promise`<{ `fileTree`: [`FileTreeDirNode`](modules.md#filetreedirnode) ; `totalFileCount`: `number` ; `totalFileSize`: `number` ; `traverseTree`: [`TraverseTree`](modules.md#traversetree)  }\>

file tree and a traverse function

#### Defined in

[src/utils/fileTree.ts:209](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileTree.ts#L209)

___

### resolveCommonDirAndTorrentName

▸ **resolveCommonDirAndTorrentName**(`name`, `fileTree`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `undefined` \| `string` |
| `fileTree` | [`FileTreeDirNode`](modules.md#filetreedirnode) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `commonDir` | `string` \| `undefined` |
| `name` | `string` |

#### Defined in

[src/utils/fileTree.ts:156](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/utils/fileTree.ts#L156)

___

### useArrayBufferPromiseHook

▸ **useArrayBufferPromiseHook**(`path`, `hooks`): [`Promise`<`ArrayBuffer`\>]

Get an array buffer promise hook handler

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `Iterable`<`string`\> |
| `hooks` | `EncoderHooks` |

#### Returns

[`Promise`<`ArrayBuffer`\>]

an array buffer

#### Defined in

[src/encode.ts:274](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/encode.ts#L274)

___

### useTextPromiseHook

▸ **useTextPromiseHook**(`path`, `hooks`): [`Promise`<`string`\>]

Get an text promise hook handler

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `Iterable`<`string`\> |
| `hooks` | `EncoderHooks` |

#### Returns

[`Promise`<`string`\>]

an text promise

#### Defined in

[src/encode.ts:287](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/encode.ts#L287)

___

### useUint8ArrayStreamHook

▸ **useUint8ArrayStreamHook**(`path`, `hooks`): [`ReadableStream`<`Uint8Array`\>]

Get a uint8 array stream hook handler

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `Iterable`<`string`\> |
| `hooks` | `EncoderHooks` |

#### Returns

[`ReadableStream`<`Uint8Array`\>]

a uint8 array readable stream

#### Defined in

[src/encode.ts:229](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/encode.ts#L229)
