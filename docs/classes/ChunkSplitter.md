[torrefy](../README.md) / [Exports](../modules.md) / ChunkSplitter

# Class: ChunkSplitter

## Hierarchy

- `TransformStream`<`Uint8Array`, `Uint8Array`\>

  ↳ **`ChunkSplitter`**

## Table of contents

### Constructors

- [constructor](ChunkSplitter.md#constructor)

### Properties

- [readable](ChunkSplitter.md#readable)
- [writable](ChunkSplitter.md#writable)

## Constructors

### constructor

• **new ChunkSplitter**(`chunkLength`, `opts?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `chunkLength` | `number` | `undefined` |
| `opts` | `Object` | `undefined` |
| `opts.padding` | `boolean` | `false` |

#### Overrides

TransformStream&lt;Uint8Array, Uint8Array\&gt;.constructor

#### Defined in

[src/transformers/chunkSplitter.ts:45](https://github.com/Sec-ant/bepjs/blob/9d6a68a/src/transformers/chunkSplitter.ts#L45)

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
