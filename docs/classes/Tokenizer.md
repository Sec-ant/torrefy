[torrefy](../README.md) / [Exports](../modules.md) / Tokenizer

# Class: Tokenizer

## Hierarchy

- `TransformStream`<`Uint8Array`, [`Token`](../modules.md#token)\>

  ↳ **`Tokenizer`**

## Table of contents

### Constructors

- [constructor](Tokenizer.md#constructor)

### Properties

- [readable](Tokenizer.md#readable)
- [writable](Tokenizer.md#writable)

## Constructors

### constructor

• **new Tokenizer**()

#### Overrides

TransformStream&lt;Uint8Array, Token\&gt;.constructor

#### Defined in

[src/transformers/tokenizer.ts:249](https://github.com/Sec-ant/bepjs/blob/5d0ef68/src/transformers/tokenizer.ts#L249)

## Properties

### readable

• `Readonly` **readable**: `ReadableStream`<`IntegerToken` \| `ByteStringToken` \| `ListStartToken` \| `ListEndToken` \| `DictionaryStartToken` \| `DictionaryEndToken`\>

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
