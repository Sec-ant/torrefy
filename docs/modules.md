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

- [BObjectLoose](interfaces/BObjectLoose.md)
- [BObjectStrict](interfaces/BObjectStrict.md)
- [ByteStringToken](interfaces/ByteStringToken.md)
- [DictionaryEndToken](interfaces/DictionaryEndToken.md)
- [DictionaryStartToken](interfaces/DictionaryStartToken.md)
- [FilePropsBase](interfaces/FilePropsBase.md)
- [FilePropsV1](interfaces/FilePropsV1.md)
- [FilePropsV2](interfaces/FilePropsV2.md)
- [FileTreeFileNode](interfaces/FileTreeFileNode.md)
- [InfoBase](interfaces/InfoBase.md)
- [InfoBaseV1](interfaces/InfoBaseV1.md)
- [InfoMultiFileHybrid](interfaces/InfoMultiFileHybrid.md)
- [InfoMultiFileV1](interfaces/InfoMultiFileV1.md)
- [InfoSingleFileHybrid](interfaces/InfoSingleFileHybrid.md)
- [InfoSingleFileV1](interfaces/InfoSingleFileV1.md)
- [InfoV2](interfaces/InfoV2.md)
- [IntegerToken](interfaces/IntegerToken.md)
- [ListEndToken](interfaces/ListEndToken.md)
- [ListStartToken](interfaces/ListStartToken.md)
- [MetaInfoBase](interfaces/MetaInfoBase.md)
- [MetaInfoHybrid](interfaces/MetaInfoHybrid.md)
- [MetaInfoV1](interfaces/MetaInfoV1.md)
- [MetaInfoV2](interfaces/MetaInfoV2.md)
- [TorrentOptionsBase](interfaces/TorrentOptionsBase.md)
- [TorrentOptionsHybrid](interfaces/TorrentOptionsHybrid.md)
- [TorrentOptionsV1](interfaces/TorrentOptionsV1.md)
- [TorrentOptionsV2](interfaces/TorrentOptionsV2.md)

### Type Aliases

- [BByteString](modules.md#bbytestring)
- [BByteStringLoose](modules.md#bbytestringloose)
- [BByteStringStrict](modules.md#bbytestringstrict)
- [BData](modules.md#bdata)
- [BDataLoose](modules.md#bdataloose)
- [BDataStrict](modules.md#bdatastrict)
- [BDictionary](modules.md#bdictionary)
- [BDictionaryLoose](modules.md#bdictionaryloose)
- [BDictionaryStrict](modules.md#bdictionarystrict)
- [BInteger](modules.md#binteger)
- [BIntegerLoose](modules.md#bintegerloose)
- [BIntegerStrict](modules.md#bintegerstrict)
- [BList](modules.md#blist)
- [BListLoose](modules.md#blistloose)
- [BListStrict](modules.md#bliststrict)
- [BMap](modules.md#bmap)
- [BObject](modules.md#bobject)
- [EncoderHook](modules.md#encoderhook)
- [EncoderHookPath](modules.md#encoderhookpath)
- [EncoderHookSystem](modules.md#encoderhooksystem)
- [ExecutableAttr](modules.md#executableattr)
- [FileAttrs](modules.md#fileattrs)
- [FileDirLike](modules.md#filedirlike)
- [FileDirLikes](modules.md#filedirlikes)
- [FileListV1](modules.md#filelistv1)
- [FileTreeDirEntry](modules.md#filetreedirentry)
- [FileTreeDirNode](modules.md#filetreedirnode)
- [FileTreeEntries](modules.md#filetreeentries)
- [FileTreeFileEntry](modules.md#filetreefileentry)
- [HiddenAttr](modules.md#hiddenattr)
- [Info](modules.md#info)
- [InfoHybrid](modules.md#infohybrid)
- [InfoV1](modules.md#infov1)
- [MetaInfo](modules.md#metainfo)
- [MetaVersion](modules.md#metaversion)
- [OnProgress](modules.md#onprogress)
- [PackedFileTreeDirEntry](modules.md#packedfiletreedirentry)
- [PackedFileTreeEntries](modules.md#packedfiletreeentries)
- [PaddingFileAttr](modules.md#paddingfileattr)
- [Permutations](modules.md#permutations)
- [PieceLayers](modules.md#piecelayers)
- [PopulateOptions](modules.md#populateoptions)
- [SetProgressTotal](modules.md#setprogresstotal)
- [SymlinkAttr](modules.md#symlinkattr)
- [Token](modules.md#token)
- [TorrentOptions](modules.md#torrentoptions)
- [TraverseTree](modules.md#traversetree)
- [UpdateProgress](modules.md#updateprogress)

### Variables

- [BLOCK\_LENGTH](modules.md#block_length)
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
- [META\_VERSION](modules.md#meta_version)

### Functions

- [compareEntryNames](modules.md#compareentrynames)
- [concatUint8Arrays](modules.md#concatuint8arrays)
- [create](modules.md#create)
- [decode](modules.md#decode)
- [encode](modules.md#encode)
- [getEntriesOfDirEntry](modules.md#getentriesofdirentry)
- [getFileOfFileEntry](modules.md#getfileoffileentry)
- [getSortedIndex](modules.md#getsortedindex)
- [getTimeStampSecondsNow](modules.md#gettimestampsecondsnow)
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

Ƭ **BByteString**<`Strict`\>: `Strict` extends ``true`` ? [`BByteStringStrict`](modules.md#bbytestringstrict) : [`BByteStringLoose`](modules.md#bbytestringloose)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Strict` | extends `boolean` = ``true`` |

#### Defined in

[src/utils/codec.ts:11](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L11)

___

### BByteStringLoose

Ƭ **BByteStringLoose**: [`BByteStringStrict`](modules.md#bbytestringstrict) \| `ArrayBuffer`

#### Defined in

[src/utils/codec.ts:10](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L10)

___

### BByteStringStrict

Ƭ **BByteStringStrict**: `string`

#### Defined in

[src/utils/codec.ts:9](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L9)

___

### BData

Ƭ **BData**<`Strict`\>: `Strict` extends ``true`` ? [`BDataStrict`](modules.md#bdatastrict) : [`BDataLoose`](modules.md#bdataloose)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Strict` | extends `boolean` = ``true`` |

#### Defined in

[src/utils/codec.ts:53](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L53)

___

### BDataLoose

Ƭ **BDataLoose**: [`BInteger`](modules.md#binteger)<``false``\> \| [`BByteString`](modules.md#bbytestring)<``false``\> \| [`BList`](modules.md#blist)<``false``\> \| [`BDictionary`](modules.md#bdictionary)<``false``\> \| `undefined` \| ``null``

#### Defined in

[src/utils/codec.ts:46](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L46)

___

### BDataStrict

Ƭ **BDataStrict**: [`BInteger`](modules.md#binteger)<``true``\> \| [`BByteString`](modules.md#bbytestring)<``true``\> \| [`BList`](modules.md#blist)<``true``\> \| [`BDictionary`](modules.md#bdictionary)<``true``\>

#### Defined in

[src/utils/codec.ts:41](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L41)

___

### BDictionary

Ƭ **BDictionary**<`Strict`\>: `Strict` extends ``true`` ? [`BDictionaryStrict`](modules.md#bdictionarystrict) : [`BDictionaryLoose`](modules.md#bdictionaryloose)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Strict` | extends `boolean` = ``true`` |

#### Defined in

[src/utils/codec.ts:36](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L36)

___

### BDictionaryLoose

Ƭ **BDictionaryLoose**: [`BObject`](modules.md#bobject)<``false``\> \| [`BMap`](modules.md#bmap)

#### Defined in

[src/utils/codec.ts:35](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L35)

___

### BDictionaryStrict

Ƭ **BDictionaryStrict**: [`BObject`](modules.md#bobject)<``true``\>

#### Defined in

[src/utils/codec.ts:34](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L34)

___

### BInteger

Ƭ **BInteger**<`Strict`\>: `Strict` extends ``true`` ? [`BIntegerStrict`](modules.md#bintegerstrict) : [`BIntegerLoose`](modules.md#bintegerloose)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Strict` | extends `boolean` = ``true`` |

#### Defined in

[src/utils/codec.ts:4](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L4)

___

### BIntegerLoose

Ƭ **BIntegerLoose**: [`BIntegerStrict`](modules.md#bintegerstrict) \| `boolean`

#### Defined in

[src/utils/codec.ts:3](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L3)

___

### BIntegerStrict

Ƭ **BIntegerStrict**: `number` \| `bigint`

#### Defined in

[src/utils/codec.ts:2](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L2)

___

### BList

Ƭ **BList**<`Strict`\>: `Strict` extends ``true`` ? [`BListStrict`](modules.md#bliststrict) : [`BListLoose`](modules.md#blistloose)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Strict` | extends `boolean` = ``true`` |

#### Defined in

[src/utils/codec.ts:18](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L18)

___

### BListLoose

Ƭ **BListLoose**: [`BData`](modules.md#bdata)<``false``\>[]

#### Defined in

[src/utils/codec.ts:17](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L17)

___

### BListStrict

Ƭ **BListStrict**: [`BData`](modules.md#bdata)<``true``\>[]

#### Defined in

[src/utils/codec.ts:16](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L16)

___

### BMap

Ƭ **BMap**: `Map`<[`BByteString`](modules.md#bbytestring)<``false``\>, [`BData`](modules.md#bdata)<``false``\>\>

#### Defined in

[src/utils/codec.ts:32](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L32)

___

### BObject

Ƭ **BObject**<`Strict`\>: `Strict` extends ``true`` ? [`BObjectStrict`](interfaces/BObjectStrict.md) : [`BObjectLoose`](interfaces/BObjectLoose.md)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Strict` | extends `boolean` = ``true`` |

#### Defined in

[src/utils/codec.ts:29](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L29)

___

### EncoderHook

Ƭ **EncoderHook**: (`result`: `IteratorResult`<`Uint8Array`, `undefined`\>) => `void`

#### Type declaration

▸ (`result`): `void`

encoder hook

##### Parameters

| Name | Type |
| :------ | :------ |
| `result` | `IteratorResult`<`Uint8Array`, `undefined`\> |

##### Returns

`void`

#### Defined in

[src/encode.ts:8](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/encode.ts#L8)

___

### EncoderHookPath

Ƭ **EncoderHookPath**: `Iterable`<`string` \| `number`\>

encoder hook path

#### Defined in

[src/encode.ts:15](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/encode.ts#L15)

___

### EncoderHookSystem

Ƭ **EncoderHookSystem**: `TrieMap`<[`EncoderHookPath`](modules.md#encoderhookpath), [`EncoderHook`](modules.md#encoderhook)\>

encoder hook system

#### Defined in

[src/encode.ts:20](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/encode.ts#L20)

___

### ExecutableAttr

Ƭ **ExecutableAttr**: ``"x"``

executable file attribute

#### Defined in

[src/utils/fileTree.ts:26](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L26)

___

### FileAttrs

Ƭ **FileAttrs**: [`Permutations`](modules.md#permutations)<[`SymlinkAttr`](modules.md#symlinkattr) \| [`ExecutableAttr`](modules.md#executableattr) \| [`HiddenAttr`](modules.md#hiddenattr) \| [`PaddingFileAttr`](modules.md#paddingfileattr)\>

file attributes

#### Defined in

[src/utils/fileTree.ts:49](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L49)

___

### FileDirLike

Ƭ **FileDirLike**: `FileSystemHandle` \| `FileSystemEntry` \| `File`

#### Defined in

[src/utils/fileDirLike.ts:1](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileDirLike.ts#L1)

___

### FileDirLikes

Ƭ **FileDirLikes**: `Iterable`<[`FileDirLike`](modules.md#filedirlike)\> \| `AsyncIterable`<[`FileDirLike`](modules.md#filedirlike)\>

#### Defined in

[src/utils/fileDirLike.ts:3](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileDirLike.ts#L3)

___

### FileListV1

Ƭ **FileListV1**: [`FilePropsV1`](interfaces/FilePropsV1.md)[]

v1 file list

#### Defined in

[src/utils/fileTree.ts:109](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L109)

___

### FileTreeDirEntry

Ƭ **FileTreeDirEntry**: [dirname: string, value: FileTreeEntries]

v2 dir entry

#### Defined in

[src/utils/fileTree.ts:137](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L137)

___

### FileTreeDirNode

Ƭ **FileTreeDirNode**: `Map`<`string`, [`FileTreeDirNode`](modules.md#filetreedirnode) \| [`FileTreeFileNode`](interfaces/FileTreeFileNode.md)\>

v2 file tree dir node

#### Defined in

[src/utils/fileTree.ts:132](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L132)

___

### FileTreeEntries

Ƭ **FileTreeEntries**: ([`FileTreeFileEntry`](modules.md#filetreefileentry) \| [`FileTreeDirEntry`](modules.md#filetreedirentry))[]

v2 file or dir entries

#### Defined in

[src/utils/fileTree.ts:147](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L147)

___

### FileTreeFileEntry

Ƭ **FileTreeFileEntry**: [filename: string, value: FileTreeFileNode]

v2 file entry

#### Defined in

[src/utils/fileTree.ts:127](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L127)

___

### HiddenAttr

Ƭ **HiddenAttr**: ``"h"``

hidden file attribute

#### Defined in

[src/utils/fileTree.ts:31](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L31)

___

### Info

Ƭ **Info**<`T`\>: `T` extends [`V1`](enums/TorrentType.md#v1) ? [`InfoV1`](modules.md#infov1) : `T` extends [`V2`](enums/TorrentType.md#v2) ? [`InfoV2`](interfaces/InfoV2.md) : `T` extends [`HYBRID`](enums/TorrentType.md#hybrid) ? [`InfoHybrid`](modules.md#infohybrid) : `never`

info

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`TorrentType`](enums/TorrentType.md) = [`TorrentType`](enums/TorrentType.md) |

#### Defined in

[src/create.ts:312](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L312)

___

### InfoHybrid

Ƭ **InfoHybrid**: [`InfoSingleFileHybrid`](interfaces/InfoSingleFileHybrid.md) \| [`InfoMultiFileHybrid`](interfaces/InfoMultiFileHybrid.md)

hybrid info

#### Defined in

[src/create.ts:307](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L307)

___

### InfoV1

Ƭ **InfoV1**: [`InfoSingleFileV1`](interfaces/InfoSingleFileV1.md) \| [`InfoMultiFileV1`](interfaces/InfoMultiFileV1.md)

v1 info

#### Defined in

[src/create.ts:272](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L272)

___

### MetaInfo

Ƭ **MetaInfo**<`T`\>: `T` extends [`V1`](enums/TorrentType.md#v1) ? [`MetaInfoV1`](interfaces/MetaInfoV1.md) : `T` extends [`V2`](enums/TorrentType.md#v2) ? [`MetaInfoV2`](interfaces/MetaInfoV2.md) : `T` extends [`HYBRID`](enums/TorrentType.md#hybrid) ? [`MetaInfoHybrid`](interfaces/MetaInfoHybrid.md) : `never`

meta info

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`TorrentType`](enums/TorrentType.md) = [`TorrentType`](enums/TorrentType.md) |

#### Defined in

[src/create.ts:393](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L393)

___

### MetaVersion

Ƭ **MetaVersion**: ``2``

meta version can only be 2 at the time being

#### Defined in

[src/create.ts:38](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L38)

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

[src/create.ts:472](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L472)

___

### PackedFileTreeDirEntry

Ƭ **PackedFileTreeDirEntry**: [dirname: string, value: FileTreeDirNode]

v2 packed dir entry

#### Defined in

[src/utils/fileTree.ts:142](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L142)

___

### PackedFileTreeEntries

Ƭ **PackedFileTreeEntries**: ([`FileTreeFileEntry`](modules.md#filetreefileentry) \| [`PackedFileTreeDirEntry`](modules.md#packedfiletreedirentry))[]

v2 packed file or dir entries

#### Defined in

[src/utils/fileTree.ts:152](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L152)

___

### PaddingFileAttr

Ƭ **PaddingFileAttr**: ``"p"``

padding file attribute

#### Defined in

[src/utils/fileTree.ts:36](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L36)

___

### Permutations

Ƭ **Permutations**<`T`, `U`\>: `T` extends `unknown` ? `T` \| \`${T}${Permutations<Exclude<U, T\>\>}\` : `never`

permutations template

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `string` |
| `U` | extends `string` = `T` |

#### Defined in

[src/utils/fileTree.ts:41](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L41)

___

### PieceLayers

Ƭ **PieceLayers**: `Map`<`ArrayBuffer`, `ArrayBuffer`\>

v2 piece layers

#### Defined in

[src/create.ts:325](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L325)

___

### PopulateOptions

Ƭ **PopulateOptions**: { `compareFunction?`: `never` ; `polyfillWebkitRelativePath?`: `boolean` ; `sort?`: ``false``  } \| { `compareFunction?`: (`entry`: [`FileTreeFileEntry`](modules.md#filetreefileentry) \| [`FileTreeDirEntry`](modules.md#filetreedirentry), `name`: `string`) => `number` ; `polyfillWebkitRelativePath?`: `boolean` ; `sort?`: ``true``  }

#### Defined in

[src/utils/fileTree.ts:186](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L186)

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

[src/create.ts:1045](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L1045)

___

### SymlinkAttr

Ƭ **SymlinkAttr**: ``"s"``

symlink file attribute

#### Defined in

[src/utils/fileTree.ts:21](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L21)

___

### Token

Ƭ **Token**<`T`\>: `T` extends [`Integer`](enums/TokenType.md#integer) ? [`IntegerToken`](interfaces/IntegerToken.md) : `T` extends [`ByteString`](enums/TokenType.md#bytestring) ? [`ByteStringToken`](interfaces/ByteStringToken.md) : `T` extends [`ListStart`](enums/TokenType.md#liststart) ? [`ListStartToken`](interfaces/ListStartToken.md) : `T` extends [`ListEnd`](enums/TokenType.md#listend) ? [`ListEndToken`](interfaces/ListEndToken.md) : `T` extends [`DictionaryStart`](enums/TokenType.md#dictionarystart) ? [`DictionaryStartToken`](interfaces/DictionaryStartToken.md) : `T` extends [`DictionaryEnd`](enums/TokenType.md#dictionaryend) ? [`DictionaryEndToken`](interfaces/DictionaryEndToken.md) : `never`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`TokenType`](enums/TokenType.md) = [`TokenType`](enums/TokenType.md) |

#### Defined in

[src/transformers/tokenizer.ts:47](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/transformers/tokenizer.ts#L47)

___

### TorrentOptions

Ƭ **TorrentOptions**<`T`\>: `T` extends [`V1`](enums/TorrentType.md#v1) ? [`TorrentOptionsV1`](interfaces/TorrentOptionsV1.md) : `T` extends [`V2`](enums/TorrentType.md#v2) ? [`TorrentOptionsV2`](interfaces/TorrentOptionsV2.md) : `T` extends [`HYBRID`](enums/TorrentType.md#hybrid) ? [`TorrentOptionsHybrid`](interfaces/TorrentOptionsHybrid.md) : `never`

torrent options

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`TorrentType`](enums/TorrentType.md) = [`TorrentType`](enums/TorrentType.md) |

#### Defined in

[src/create.ts:171](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L171)

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

[src/utils/fileTree.ts:201](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L201)

___

### UpdateProgress

Ƭ **UpdateProgress**: () => `Promise`<`void`\>

#### Type declaration

▸ (): `Promise`<`void`\>

##### Returns

`Promise`<`void`\>

#### Defined in

[src/create.ts:1051](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L1051)

## Variables

### BLOCK\_LENGTH

• `Const` **BLOCK\_LENGTH**: `number`

default block length 1 << 14 = 16384

#### Defined in

[src/create.ts:424](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L424)

___

### BUFF\_0

• `Const` **BUFF\_0**: `Uint8Array`

bencode buff: 0 (stands for 0)

#### Defined in

[src/utils/codec.ts:125](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L125)

___

### BUFF\_COLON

• `Const` **BUFF\_COLON**: `Uint8Array`

bencode buff: : (stands for byte string length end)

#### Defined in

[src/utils/codec.ts:105](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L105)

___

### BUFF\_D

• `Const` **BUFF\_D**: `Uint8Array`

bencode buff: d (stands for dictionary start)

#### Defined in

[src/utils/codec.ts:75](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L75)

___

### BUFF\_E

• `Const` **BUFF\_E**: `Uint8Array`

bencode buff: e (stands for end)

#### Defined in

[src/utils/codec.ts:85](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L85)

___

### BUFF\_I

• `Const` **BUFF\_I**: `Uint8Array`

bencode buff: i (stands for integer start)

#### Defined in

[src/utils/codec.ts:95](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L95)

___

### BUFF\_L

• `Const` **BUFF\_L**: `Uint8Array`

bencode buff: l (stands for list start)

#### Defined in

[src/utils/codec.ts:65](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L65)

___

### BUFF\_MINUS

• `Const` **BUFF\_MINUS**: `Uint8Array`

bencode buff: - (stands for -)

#### Defined in

[src/utils/codec.ts:115](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L115)

___

### BYTE\_0

• `Const` **BYTE\_0**: ``48``

bencode byte: 0 (stands for 0)

#### Defined in

[src/utils/codec.ts:120](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L120)

___

### BYTE\_COLON

• `Const` **BYTE\_COLON**: ``58``

bencode byte: : (stands for byte string length end)

#### Defined in

[src/utils/codec.ts:100](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L100)

___

### BYTE\_D

• `Const` **BYTE\_D**: ``100``

bencode byte: d (stands for dictionary start)

#### Defined in

[src/utils/codec.ts:70](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L70)

___

### BYTE\_E

• `Const` **BYTE\_E**: ``101``

bencode byte: e (stands for end)

#### Defined in

[src/utils/codec.ts:80](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L80)

___

### BYTE\_I

• `Const` **BYTE\_I**: ``105``

bencode byte: i (stands for integer start)

#### Defined in

[src/utils/codec.ts:90](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L90)

___

### BYTE\_L

• `Const` **BYTE\_L**: ``108``

bencode byte: l (stands for list start)

#### Defined in

[src/utils/codec.ts:60](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L60)

___

### BYTE\_MINUS

• `Const` **BYTE\_MINUS**: ``45``

bencode byte: - (stands for -)

#### Defined in

[src/utils/codec.ts:110](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L110)

___

### META\_VERSION

• `Const` **META\_VERSION**: [`MetaVersion`](modules.md#metaversion) = `2`

default meta version = 2

#### Defined in

[src/create.ts:429](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L429)

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

[src/utils/fileTree.ts:508](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L508)

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

[src/utils/misc.ts:61](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/misc.ts#L61)

___

### create

▸ **create**(`fileDirLikes`, `opts?`, `onProgress?`): `Promise`<`undefined` \| [`MetaInfoV1`](interfaces/MetaInfoV1.md) \| [`MetaInfoV2`](interfaces/MetaInfoV2.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fileDirLikes` | [`FileDirLikes`](modules.md#filedirlikes) |
| `opts` | [`TorrentOptionsV1`](interfaces/TorrentOptionsV1.md) \| [`TorrentOptionsV2`](interfaces/TorrentOptionsV2.md) \| [`TorrentOptionsHybrid`](interfaces/TorrentOptionsHybrid.md) |
| `onProgress?` | [`OnProgress`](modules.md#onprogress) |

#### Returns

`Promise`<`undefined` \| [`MetaInfoV1`](interfaces/MetaInfoV1.md) \| [`MetaInfoV2`](interfaces/MetaInfoV2.md)\>

#### Defined in

[src/create.ts:906](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L906)

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

[src/decode.ts:130](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/decode.ts#L130)

___

### encode

▸ **encode**(`data`, `hookSystem?`): `ReadableStream`<`Uint8Array`\>

Bencode

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`BDataLoose`](modules.md#bdataloose) |
| `hookSystem?` | [`EncoderHookSystem`](modules.md#encoderhooksystem) |

#### Returns

`ReadableStream`<`Uint8Array`\>

readable stream of the bencoded data

#### Defined in

[src/encode.ts:203](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/encode.ts#L203)

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

[src/utils/fileDirLike.ts:69](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileDirLike.ts#L69)

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

[src/utils/fileDirLike.ts:82](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileDirLike.ts#L82)

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

[src/utils/misc.ts:9](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/misc.ts#L9)

___

### getTimeStampSecondsNow

▸ **getTimeStampSecondsNow**(): `number`

Get time stamp seconds now

#### Returns

`number`

time stamp now in seconds

#### Defined in

[src/utils/misc.ts:88](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/misc.ts#L88)

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

[src/utils/codec.ts:132](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/codec.ts#L132)

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

[src/utils/fileDirLike.ts:5](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileDirLike.ts#L5)

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

[src/utils/fileDirLike.ts:9](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileDirLike.ts#L9)

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

[src/utils/fileDirLike.ts:29](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileDirLike.ts#L29)

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

[src/utils/fileDirLike.ts:19](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileDirLike.ts#L19)

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

[src/utils/fileDirLike.ts:45](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileDirLike.ts#L45)

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

[src/utils/fileTree.ts:501](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L501)

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

[src/utils/fileTree.ts:489](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L489)

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

[src/utils/fileTree.ts:495](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L495)

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

[src/utils/fileTree.ts:483](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L483)

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

[src/utils/misc.ts:44](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/misc.ts#L44)

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

[src/utils/misc.ts:98](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/misc.ts#L98)

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

[src/utils/misc.ts:80](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/misc.ts#L80)

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

[src/utils/fileTree.ts:458](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L458)

___

### parse

▸ **parse**(`tokenReadableStream`): `Promise`<[`BData`](modules.md#bdata) \| `undefined`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `tokenReadableStream` | `ReadableStream`<[`IntegerToken`](interfaces/IntegerToken.md) \| [`ByteStringToken`](interfaces/ByteStringToken.md) \| [`ListStartToken`](interfaces/ListStartToken.md) \| [`ListEndToken`](interfaces/ListEndToken.md) \| [`DictionaryStartToken`](interfaces/DictionaryStartToken.md) \| [`DictionaryEndToken`](interfaces/DictionaryEndToken.md)\> |

#### Returns

`Promise`<[`BData`](modules.md#bdata) \| `undefined`\>

#### Defined in

[src/decode.ts:11](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/decode.ts#L11)

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

[src/utils/fileTree.ts:211](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L211)

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

[src/utils/fileTree.ts:157](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L157)

___

### useArrayBufferPromiseHook

▸ **useArrayBufferPromiseHook**(`path`, `hookSystem`): `Promise`<`ArrayBuffer`\>

Register a hook and consume the result as an array buffer promise

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | [`EncoderHookPath`](modules.md#encoderhookpath) |
| `hookSystem` | [`EncoderHookSystem`](modules.md#encoderhooksystem) |

#### Returns

`Promise`<`ArrayBuffer`\>

an array buffer promise

#### Defined in

[src/encode.ts:287](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/encode.ts#L287)

___

### useTextPromiseHook

▸ **useTextPromiseHook**(`path`, `hookSystem`): `Promise`<`string`\>

Register a hook and consume the result as a text promise

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | [`EncoderHookPath`](modules.md#encoderhookpath) |
| `hookSystem` | [`EncoderHookSystem`](modules.md#encoderhooksystem) |

#### Returns

`Promise`<`string`\>

a text promise

#### Defined in

[src/encode.ts:302](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/encode.ts#L302)

___

### useUint8ArrayStreamHook

▸ **useUint8ArrayStreamHook**(`path`, `hookSystem`): `ReadableStream`<`Uint8Array`\>

Register a hook and consume the result as an uint8 array readable stream

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | [`EncoderHookPath`](modules.md#encoderhookpath) |
| `hookSystem` | [`EncoderHookSystem`](modules.md#encoderhooksystem) |

#### Returns

`ReadableStream`<`Uint8Array`\>

an uint8 array readable stream

#### Defined in

[src/encode.ts:242](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/encode.ts#L242)
