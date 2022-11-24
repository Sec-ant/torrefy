[torrefy](../README.md) / [Exports](../modules.md) / InfoBaseV1

# Interface: InfoBaseV1

v1 info base

## Hierarchy

- [`InfoBase`](InfoBase.md)

  ↳ **`InfoBaseV1`**

  ↳↳ [`InfoSingleFileV1`](InfoSingleFileV1.md)

  ↳↳ [`InfoMultiFileV1`](InfoMultiFileV1.md)

## Table of contents

### Properties

- [name](InfoBaseV1.md#name)
- [piece length](InfoBaseV1.md#piece length)
- [pieces](InfoBaseV1.md#pieces)
- [private](InfoBaseV1.md#private)
- [source](InfoBaseV1.md#source)

## Properties

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

### pieces

• **pieces**: `string` \| `ArrayBuffer`

Pieces maps to a string whose length is a multiple of 20

[BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=M%20as%20default%29.-,pieces,-maps%20to%20a)

#### Defined in

[src/create.ts:252](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L252)

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
