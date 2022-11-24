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

[src/transformers/tokenizer.ts:248](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/transformers/tokenizer.ts#L248)

## Properties

### readable

• `Readonly` **readable**: `ReadableStream`<[`IntegerToken`](../interfaces/IntegerToken.md) \| [`ByteStringToken`](../interfaces/ByteStringToken.md) \| [`ListStartToken`](../interfaces/ListStartToken.md) \| [`ListEndToken`](../interfaces/ListEndToken.md) \| [`DictionaryStartToken`](../interfaces/DictionaryStartToken.md) \| [`DictionaryEndToken`](../interfaces/DictionaryEndToken.md)\>

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
