[torrefy](../README.md) / [Exports](../modules.md) / PieceHasher

# Class: PieceHasher

## Hierarchy

- `TransformStream`<`Uint8Array`, `Uint8Array`\>

  ↳ **`PieceHasher`**

## Table of contents

### Constructors

- [constructor](PieceHasher.md#constructor)

### Properties

- [readable](PieceHasher.md#readable)
- [writable](PieceHasher.md#writable)

## Constructors

### constructor

• **new PieceHasher**(`updateProgress?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `updateProgress?` | [`UpdateProgress`](../modules.md#updateprogress) |

#### Overrides

TransformStream&lt;Uint8Array, Uint8Array\&gt;.constructor

#### Defined in

[src/transformers/pieceHasher.ts:32](https://github.com/Sec-ant/bepjs/blob/9590005/src/transformers/pieceHasher.ts#L32)

## Properties

### readable

• `Readonly` **readable**: `ReadableStream`<`Uint8Array`\>

#### Inherited from

TransformStream.readable

#### Defined in

node_modules/typescript/lib/lib.dom.d.ts:14430

___

### writable

• `Readonly` **writable**: `WritableStream`<`Uint8Array`\>

#### Inherited from

TransformStream.writable

#### Defined in

node_modules/typescript/lib/lib.dom.d.ts:14431
