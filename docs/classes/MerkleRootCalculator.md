[torrefy](../README.md) / [Exports](../modules.md) / MerkleRootCalculator

# Class: MerkleRootCalculator

## Hierarchy

- `TransformStream`<`Uint8Array`[], `Uint8Array`\>

  ↳ **`MerkleRootCalculator`**

## Table of contents

### Constructors

- [constructor](MerkleRootCalculator.md#constructor)

### Properties

- [readable](MerkleRootCalculator.md#readable)
- [writable](MerkleRootCalculator.md#writable)

## Constructors

### constructor

• **new MerkleRootCalculator**(`updateProgress?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `updateProgress?` | [`UpdateProgress`](../modules.md#updateprogress) |

#### Overrides

TransformStream&lt;
  Uint8Array[],
  Uint8Array
\&gt;.constructor

#### Defined in

[src/transformers/merkleRootCalculator.ts:28](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/transformers/merkleRootCalculator.ts#L28)

## Properties

### readable

• `Readonly` **readable**: `ReadableStream`<`Uint8Array`\>

#### Inherited from

TransformStream.readable

#### Defined in

node_modules/typescript/lib/lib.dom.d.ts:14430

___

### writable

• `Readonly` **writable**: `WritableStream`<`Uint8Array`[]\>

#### Inherited from

TransformStream.writable

#### Defined in

node_modules/typescript/lib/lib.dom.d.ts:14431
