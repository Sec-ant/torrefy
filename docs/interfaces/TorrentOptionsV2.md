[torrefy](../README.md) / [Exports](../modules.md) / TorrentOptionsV2

# Interface: TorrentOptionsV2

v2 torrent options

## Hierarchy

- [`TorrentOptionsBase`](TorrentOptionsBase.md)

  ↳ **`TorrentOptionsV2`**

## Table of contents

### Properties

- [addCreatedBy](TorrentOptionsV2.md#addcreatedby)
- [addCreationDate](TorrentOptionsV2.md#addcreationdate)
- [announce](TorrentOptionsV2.md#announce)
- [announceList](TorrentOptionsV2.md#announcelist)
- [blockLength](TorrentOptionsV2.md#blocklength)
- [comment](TorrentOptionsV2.md#comment)
- [isPrivate](TorrentOptionsV2.md#isprivate)
- [metaVersion](TorrentOptionsV2.md#metaversion)
- [name](TorrentOptionsV2.md#name)
- [pieceLength](TorrentOptionsV2.md#piecelength)
- [source](TorrentOptionsV2.md#source)
- [type](TorrentOptionsV2.md#type)
- [urlList](TorrentOptionsV2.md#urllist)

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

[src/create.ts:147](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L147)

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

• **type**: [`V2`](../enums/TorrentType.md#v2)

torrent type: V2

#### Defined in

[src/create.ts:151](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L151)

___

### urlList

• `Optional` **urlList**: `string`[]

url list

[BEP 9](http://www.bittorrent.org/beps/bep_0019.html#metadata-extension)

#### Inherited from

[TorrentOptionsBase](TorrentOptionsBase.md).[urlList](TorrentOptionsBase.md#urllist)

#### Defined in

[src/create.ts:115](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L115)
