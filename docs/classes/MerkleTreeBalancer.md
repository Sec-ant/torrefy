[torrefy](../README.md) / [Exports](../modules.md) / MerkleTreeBalancer

# Class: MerkleTreeBalancer

## Hierarchy

- `TransformStream`<`Uint8Array`, `Uint8Array`[]\>

  ↳ **`MerkleTreeBalancer`**

## Table of contents

### Constructors

- [constructor](MerkleTreeBalancer.md#constructor)

### Properties

- [readable](MerkleTreeBalancer.md#readable)
- [writable](MerkleTreeBalancer.md#writable)

## Constructors

### constructor

• **new MerkleTreeBalancer**(`blocksPerPiece`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `blocksPerPiece` | `number` |

#### Overrides

TransformStream&lt;
  Uint8Array,
  Uint8Array[]
\&gt;.constructor

#### Defined in

[src/transformers/merkleTreeBalancer.ts:40](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/transformers/merkleTreeBalancer.ts#L40)

## Properties

### readable

• `Readonly` **readable**: `ReadableStream`<`Uint8Array`[]\>

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
