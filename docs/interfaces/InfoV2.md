[torrefy](../README.md) / [Exports](../modules.md) / InfoV2

# Interface: InfoV2

v2 info

## Hierarchy

- [`InfoBase`](InfoBase.md)

  ↳ **`InfoV2`**

  ↳↳ [`InfoSingleFileHybrid`](InfoSingleFileHybrid.md)

  ↳↳ [`InfoMultiFileHybrid`](InfoMultiFileHybrid.md)

## Table of contents

### Properties

- [file tree](InfoV2.md#file tree)
- [meta version](InfoV2.md#meta version)
- [name](InfoV2.md#name)
- [piece length](InfoV2.md#piece length)
- [private](InfoV2.md#private)
- [source](InfoV2.md#source)

## Properties

### file tree

• **file tree**: [`FileTreeDirNode`](../modules.md#filetreedirnode)

A tree of dictionaries where dictionary keys
represent UTF-8 encoded path elements

[BEP 52](https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=about%20invalid%20files.-,file%20tree,-A%20tree%20of)

#### Defined in

[src/create.ts:284](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L284)

___

### meta version

• **meta version**: `number`

An integer value, set to 2 to indicate compatibility
with the current revision of this specification

[BEP 52](https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=an%20alignment%20gap.-,meta%20version,-An%20integer%20value)

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

[InfoBase](InfoBase.md).[name](InfoBase.md#name)

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

[InfoBase](InfoBase.md).[piece length](InfoBase.md#piece length)

#### Defined in

[src/create.ts:232](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L232)

___

### private

• `Optional` **private**: `boolean`

is private torrent

#### Inherited from

[InfoBase](InfoBase.md).[private](InfoBase.md#private)

#### Defined in

[src/create.ts:236](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L236)

___

### source

• `Optional` **source**: `string`

source

#### Inherited from

[InfoBase](InfoBase.md).[source](InfoBase.md#source)

#### Defined in

[src/create.ts:240](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L240)
