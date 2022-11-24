[torrefy](../README.md) / [Exports](../modules.md) / InfoMultiFileV1

# Interface: InfoMultiFileV1

v1 multi file info

## Hierarchy

- [`InfoBaseV1`](InfoBaseV1.md)

  ↳ **`InfoMultiFileV1`**

  ↳↳ [`InfoMultiFileHybrid`](InfoMultiFileHybrid.md)

## Table of contents

### Properties

- [files](InfoMultiFileV1.md#files)
- [name](InfoMultiFileV1.md#name)
- [piece length](InfoMultiFileV1.md#piece length)
- [pieces](InfoMultiFileV1.md#pieces)
- [private](InfoMultiFileV1.md#private)
- [source](InfoMultiFileV1.md#source)

## Properties

### files

• **files**: [`FileListV1`](../modules.md#filelistv1)

#### Defined in

[src/create.ts:266](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L266)

___

### name

• **name**: `string`

The suggested name to save the file (or directory) as.
It is purely advisory

[BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=The-,name,-key%20maps%20to)
|
[BEP 52](https://www.bittorrent.org/beps/bep_0052.html#:~:text=info%20dictionary-,name,-A%20display%20name)

#### Inherited from

[InfoBaseV1](InfoBaseV1.md).[name](InfoBaseV1.md#name)

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

[InfoBaseV1](InfoBaseV1.md).[piece length](InfoBaseV1.md#piece length)

#### Defined in

[src/create.ts:232](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L232)

___

### pieces

• **pieces**: `string` \| `ArrayBuffer`

Pieces maps to a string whose length is a multiple of 20

[BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=M%20as%20default%29.-,pieces,-maps%20to%20a)

#### Inherited from

[InfoBaseV1](InfoBaseV1.md).[pieces](InfoBaseV1.md#pieces)

#### Defined in

[src/create.ts:252](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L252)

___

### private

• `Optional` **private**: `boolean`

is private torrent

#### Inherited from

[InfoBaseV1](InfoBaseV1.md).[private](InfoBaseV1.md#private)

#### Defined in

[src/create.ts:236](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L236)

___

### source

• `Optional` **source**: `string`

source

#### Inherited from

[InfoBaseV1](InfoBaseV1.md).[source](InfoBaseV1.md#source)

#### Defined in

[src/create.ts:240](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L240)
