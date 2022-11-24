[torrefy](../README.md) / [Exports](../modules.md) / InfoSingleFileHybrid

# Interface: InfoSingleFileHybrid

hybrid single file info

## Hierarchy

- [`InfoSingleFileV1`](InfoSingleFileV1.md)

- [`InfoV2`](InfoV2.md)

  ↳ **`InfoSingleFileHybrid`**

## Table of contents

### Properties

- [file tree](InfoSingleFileHybrid.md#file tree)
- [length](InfoSingleFileHybrid.md#length)
- [meta version](InfoSingleFileHybrid.md#meta version)
- [name](InfoSingleFileHybrid.md#name)
- [piece length](InfoSingleFileHybrid.md#piece length)
- [pieces](InfoSingleFileHybrid.md#pieces)
- [private](InfoSingleFileHybrid.md#private)
- [source](InfoSingleFileHybrid.md#source)

## Properties

### file tree

• **file tree**: [`FileTreeDirNode`](../modules.md#filetreedirnode)

A tree of dictionaries where dictionary keys
represent UTF-8 encoded path elements

[BEP 52](https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=about%20invalid%20files.-,file%20tree,-A%20tree%20of)

#### Inherited from

[InfoV2](InfoV2.md).[file tree](InfoV2.md#file tree)

#### Defined in

[src/create.ts:284](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L284)

___

### length

• **length**: `number`

#### Inherited from

[InfoSingleFileV1](InfoSingleFileV1.md).[length](InfoSingleFileV1.md#length)

#### Defined in

[src/create.ts:259](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L259)

___

### meta version

• **meta version**: `number`

An integer value, set to 2 to indicate compatibility
with the current revision of this specification

[BEP 52](https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=an%20alignment%20gap.-,meta%20version,-An%20integer%20value)

#### Inherited from

[InfoV2](InfoV2.md).[meta version](InfoV2.md#meta version)

#### Defined in

[src/create.ts:291](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L291)

___

### name

• **name**: `string`

The suggested name to save the file (or directory) as.
It is purely advisory

[BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=The-,name,-key%20maps%20to)
|
[BEP 52](https://www.bittorrent.org/beps/bep_0052.html#:~:text=info%20dictionary-,name,-A%20display%20name)

#### Inherited from

[InfoV2](InfoV2.md).[name](InfoV2.md#name)

#### Defined in

[src/create.ts:223](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L223)

___

### piece length

• **piece length**: `number`

The number of bytes that each logical piece
in the peer protocol refers to

[BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=is%20purely%20advisory.-,piece%20length,-maps%20to%20the)
|
[BEP 52](https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=is%20purely%20advisory.-,piece%20length,-The%20number%20of)

#### Inherited from

[InfoV2](InfoV2.md).[piece length](InfoV2.md#piece length)

#### Defined in

[src/create.ts:232](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L232)

___

### pieces

• **pieces**: `string` \| `ArrayBuffer`

Pieces maps to a string whose length is a multiple of 20

[BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=M%20as%20default%29.-,pieces,-maps%20to%20a)

#### Inherited from

[InfoSingleFileV1](InfoSingleFileV1.md).[pieces](InfoSingleFileV1.md#pieces)

#### Defined in

[src/create.ts:252](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L252)

___

### private

• `Optional` **private**: `boolean`

is private torrent

#### Inherited from

[InfoV2](InfoV2.md).[private](InfoV2.md#private)

#### Defined in

[src/create.ts:236](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L236)

___

### source

• `Optional` **source**: `string`

source

#### Inherited from

[InfoV2](InfoV2.md).[source](InfoV2.md#source)

#### Defined in

[src/create.ts:240](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L240)
