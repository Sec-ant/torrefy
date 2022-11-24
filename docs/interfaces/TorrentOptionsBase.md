[torrefy](../README.md) / [Exports](../modules.md) / TorrentOptionsBase

# Interface: TorrentOptionsBase

base torrent options

## Hierarchy

- **`TorrentOptionsBase`**

  ↳ [`TorrentOptionsV1`](TorrentOptionsV1.md)

  ↳ [`TorrentOptionsV2`](TorrentOptionsV2.md)

  ↳ [`TorrentOptionsHybrid`](TorrentOptionsHybrid.md)

## Table of contents

### Properties

- [addCreatedBy](TorrentOptionsBase.md#addcreatedby)
- [addCreationDate](TorrentOptionsBase.md#addcreationdate)
- [announce](TorrentOptionsBase.md#announce)
- [announceList](TorrentOptionsBase.md#announcelist)
- [blockLength](TorrentOptionsBase.md#blocklength)
- [comment](TorrentOptionsBase.md#comment)
- [isPrivate](TorrentOptionsBase.md#isprivate)
- [name](TorrentOptionsBase.md#name)
- [pieceLength](TorrentOptionsBase.md#piecelength)
- [source](TorrentOptionsBase.md#source)
- [urlList](TorrentOptionsBase.md#urllist)

## Properties

### addCreatedBy

• `Optional` **addCreatedBy**: `boolean`

add created by whom

#### Defined in

[src/create.ts:71](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L71)

___

### addCreationDate

• `Optional` **addCreationDate**: `boolean`

add creation date

#### Defined in

[src/create.ts:75](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L75)

___

### announce

• `Optional` **announce**: `string`

announce url

#### Defined in

[src/create.ts:79](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L79)

___

### announceList

• `Optional` **announceList**: `string`[][]

announce url list

#### Defined in

[src/create.ts:83](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L83)

___

### blockLength

• `Optional` **blockLength**: `number`

block length: 16384 (16 KiB) by default
(do not alter this value)

#### Defined in

[src/create.ts:88](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L88)

___

### comment

• `Optional` **comment**: `string`

comment

#### Defined in

[src/create.ts:92](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L92)

___

### isPrivate

• `Optional` **isPrivate**: `boolean`

is private torrent

#### Defined in

[src/create.ts:96](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L96)

___

### name

• `Optional` **name**: `string`

torrent name

#### Defined in

[src/create.ts:100](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L100)

___

### pieceLength

• `Optional` **pieceLength**: `number`

piece length: a power of 2 number,
will automatically calculate when this value is missing

#### Defined in

[src/create.ts:105](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L105)

___

### source

• `Optional` **source**: `string`

source

#### Defined in

[src/create.ts:109](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L109)

___

### urlList

• `Optional` **urlList**: `string`[]

url list

[BEP 9](http://www.bittorrent.org/beps/bep_0019.html#metadata-extension)

#### Defined in

[src/create.ts:115](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L115)
