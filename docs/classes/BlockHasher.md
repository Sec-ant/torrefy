[torrefy](../README.md) / [Exports](../modules.md) / BlockHasher

# Class: BlockHasher

## Hierarchy

- `TransformStream`<`Uint8Array`, `Uint8Array`[]\>

  ↳ **`BlockHasher`**

## Table of contents

### Constructors

- [constructor](BlockHasher.md#constructor)

### Properties

- [readable](BlockHasher.md#readable)
- [writable](BlockHasher.md#writable)

## Constructors

### constructor

• **new BlockHasher**(`blocksPerPiece`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `blocksPerPiece` | `number` |

#### Overrides

TransformStream&lt;Uint8Array, Uint8Array[]\&gt;.constructor

#### Defined in

[src/transformers/blockHasher.ts:67](https://github.com/Sec-ant/bepjs/blob/9d6a68a/src/transformers/blockHasher.ts#L67)

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
