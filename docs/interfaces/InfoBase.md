[torrefy](../README.md) / [Exports](../modules.md) / InfoBase

# Interface: InfoBase

info base

## Hierarchy

- [`BObject`](../modules.md#bobject)<``false``\>

  ↳ **`InfoBase`**

  ↳↳ [`InfoBaseV1`](InfoBaseV1.md)

  ↳↳ [`InfoV2`](InfoV2.md)

## Table of contents

### Properties

- [name](InfoBase.md#name)
- [piece length](InfoBase.md#piece length)
- [private](InfoBase.md#private)
- [source](InfoBase.md#source)

## Properties

### name

• **name**: `string`

The suggested name to save the file (or directory) as.
It is purely advisory

[BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=The-,name,-key%20maps%20to)
|
[BEP 52](https://www.bittorrent.org/beps/bep_0052.html#:~:text=info%20dictionary-,name,-A%20display%20name)

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

#### Defined in

[src/create.ts:232](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L232)

___

### private

• `Optional` **private**: `boolean`

is private torrent

#### Defined in

[src/create.ts:236](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L236)

___

### source

• `Optional` **source**: `string`

source

#### Defined in

[src/create.ts:240](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L240)
