[torrefy](../README.md) / [Exports](../modules.md) / TorrentOptionsHybrid

# Interface: TorrentOptionsHybrid

v1 + v2 hybrid torrent options

## Hierarchy

- [`TorrentOptionsBase`](TorrentOptionsBase.md)

  ↳ **`TorrentOptionsHybrid`**

## Table of contents

### Properties

- [addCreatedBy](TorrentOptionsHybrid.md#addcreatedby)
- [addCreationDate](TorrentOptionsHybrid.md#addcreationdate)
- [announce](TorrentOptionsHybrid.md#announce)
- [announceList](TorrentOptionsHybrid.md#announcelist)
- [blockLength](TorrentOptionsHybrid.md#blocklength)
- [comment](TorrentOptionsHybrid.md#comment)
- [isPrivate](TorrentOptionsHybrid.md#isprivate)
- [metaVersion](TorrentOptionsHybrid.md#metaversion)
- [name](TorrentOptionsHybrid.md#name)
- [pieceLength](TorrentOptionsHybrid.md#piecelength)
- [source](TorrentOptionsHybrid.md#source)
- [type](TorrentOptionsHybrid.md#type)
- [urlList](TorrentOptionsHybrid.md#urllist)

## Properties

### addCreatedBy

• `Optional` **addCreatedBy**: `boolean`

add created by whom

#### Inherited from

[TorrentOptionsBase](TorrentOptionsBase.md).[addCreatedBy](TorrentOptionsBase.md#addcreatedby)

#### Defined in

[src/create.ts:71](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L71)

___

### addCreationDate

• `Optional` **addCreationDate**: `boolean`

add creation date

#### Inherited from

[TorrentOptionsBase](TorrentOptionsBase.md).[addCreationDate](TorrentOptionsBase.md#addcreationdate)

#### Defined in

[src/create.ts:75](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L75)

___

### announce

• `Optional` **announce**: `string`

announce url

#### Inherited from

[TorrentOptionsBase](TorrentOptionsBase.md).[announce](TorrentOptionsBase.md#announce)

#### Defined in

[src/create.ts:79](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L79)

___

### announceList

• `Optional` **announceList**: `string`[][]

announce url list

#### Inherited from

[TorrentOptionsBase](TorrentOptionsBase.md).[announceList](TorrentOptionsBase.md#announcelist)

#### Defined in

[src/create.ts:83](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L83)

___

### blockLength

• `Optional` **blockLength**: `number`

block length: 16384 (16 KiB) by default
(do not alter this value)

#### Inherited from

[TorrentOptionsBase](TorrentOptionsBase.md).[blockLength](TorrentOptionsBase.md#blocklength)

#### Defined in

[src/create.ts:88](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L88)

___

### comment

• `Optional` **comment**: `string`

comment

#### Inherited from

[TorrentOptionsBase](TorrentOptionsBase.md).[comment](TorrentOptionsBase.md#comment)

#### Defined in

[src/create.ts:92](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L92)

___

### isPrivate

• `Optional` **isPrivate**: `boolean`

is private torrent

#### Inherited from

[TorrentOptionsBase](TorrentOptionsBase.md).[isPrivate](TorrentOptionsBase.md#isprivate)

#### Defined in

[src/create.ts:96](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L96)

___

### metaVersion

• `Optional` **metaVersion**: ``2``

meta version

#### Defined in

[src/create.ts:161](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L161)

___

### name

• `Optional` **name**: `string`

torrent name

#### Inherited from

[TorrentOptionsBase](TorrentOptionsBase.md).[name](TorrentOptionsBase.md#name)

#### Defined in

[src/create.ts:100](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L100)

___

### pieceLength

• `Optional` **pieceLength**: `number`

piece length: a power of 2 number,
will automatically calculate when this value is missing

#### Inherited from

[TorrentOptionsBase](TorrentOptionsBase.md).[pieceLength](TorrentOptionsBase.md#piecelength)

#### Defined in

[src/create.ts:105](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L105)

___

### source

• `Optional` **source**: `string`

source

#### Inherited from

[TorrentOptionsBase](TorrentOptionsBase.md).[source](TorrentOptionsBase.md#source)

#### Defined in

[src/create.ts:109](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L109)

___

### type

• **type**: [`HYBRID`](../enums/TorrentType.md#hybrid)

torrent type: HYBRID

#### Defined in

[src/create.ts:165](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L165)

___

### urlList

• `Optional` **urlList**: `string`[]

url list

[BEP 9](http://www.bittorrent.org/beps/bep_0019.html#metadata-extension)

#### Inherited from

[TorrentOptionsBase](TorrentOptionsBase.md).[urlList](TorrentOptionsBase.md#urllist)

#### Defined in

[src/create.ts:115](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L115)
