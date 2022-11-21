<div align="center">
<img width="200" src="https://user-images.githubusercontent.com/10386119/202842623-06e8ca3f-5761-41ed-9a8a-3a617b4e33a5.svg">
  <h1>torrefy</h1>
  <p>
    <img src="https://img.shields.io/github/languages/top/Sec-ant/torrefy" alt="GitHub top language"> <a href="https://www.npmjs.com/package/torrefy"><img src="https://img.shields.io/npm/v/torrefy" alt="npm version"></a> <a href="https://www.npmjs.com/package/torrefy"><img src="https://img.shields.io/npm/dm/torrefy" alt="npm downloads"></a> <a href="https://www.jsdelivr.com/package/npm/torrefy"><img src="https://data.jsdelivr.com/v1/package/npm/torrefy/badge?style=rounded" alt=""></a> <img src="https://img.shields.io/github/search/Sec-ant/torrefy/goto" alt="GitHub search hit counter"> <a href="https://openbase.com/js/torrefy?utm_source=embedded&amp;utm_medium=badge&amp;utm_campaign=rate-badge"><img src="https://badges.openbase.com/js/rating/torrefy.svg?token=UY9uJPeXa2wpaK3OZLFien356kfd00deRlZejfs6B6g=" alt="Rate this package"></a>
  </p>
  <p>
    An <a href="https://developer.mozilla.org/docs/Web/JavaScript/Guide/Modules">ESM</a> package that uses <a href="https://developer.mozilla.org/docs/Web/API/Streams_API">Web Streams API</a> to create v1, v2 or hybrid torrents in your web browser.
  </p>
  <p>
    🏗This package is under active development.🏗
  </p>
</div>

## Install

```bash
npm i torrefy # or yarn add torrefy
```

## Basic usage

```ts
import { create, encode, decode } from "torrefy";

// create a test file
const testFile = new File(
  ["Hello world. This is the test file content."],
  "testfile.txt"
);

// calculate (hash) the meta info of the test file
const metaInfo = await create([testFile]);

// bencode meta info into a readable stream
const torrentStream = encode(metaInfo);

// tee the readable stream into two readable streams
const [torrentStream1, torrentStream2] = torrentStream.tee();

// consume the first readable stream as an array buffer
const torrentBinary = await new Response(torrentStream1).arrayBuffer();

// decode the second readable stream into meta info
const decodedMetaInfo = await decode(torrentStream2);
```

## Features

### Supports Creating V1, V2 or Hybrid Torrents

This package supports creating [v1](http://bittorrent.org/beps/bep_0003.html), [v2](https://www.bittorrent.org/beps/bep_0052.html) ([introduction blog](https://blog.libtorrent.org/2020/09/bittorrent-v2/)) or [hybrid](https://www.bittorrent.org/beps/bep_0052.html#upgrade-path) ([introduction blog](https://blog.libtorrent.org/2020/09/bittorrent-v2/#:~:text=for%20backwards%20compatibility.-,backwards%20compatibility,-All%20new%20features)) torrents.

### Covers Various Web File APIs

This package can handle input files or directories acquired from [File API](https://developer.mozilla.org/docs/Web/API/File), [File and Directory Entries API](https://developer.mozilla.org/docs/Web/API/File_and_Directory_Entries_API) or [File System Access API](https://developer.mozilla.org/docs/Web/API/File_System_Access_API).

### Supports Comprehensive Options

TBD

### Supports Handling Progress

TBD

### Exposes Stream-Based APIs

The `create` function consumes an [iterable](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol) of input files as [`ReadableStream`](https://developer.mozilla.org/docs/Web/API/ReadableStream)s with options and populates a `MetaInfo` object. This function internally uses several [`TransformStream`](https://developer.mozilla.org/docs/Web/API/TransformStream)s to chop the files into pieces and hash them.

The `encode` function consumes any bcodec friendly entity (e.g. `MetaInfo` object) and [bencode](http://bittorrent.org/beps/bep_0003.html#bencoding)s it into a `ReadableStream`.

The `decode` function consumes any bcodec friendly `ReadableStream` (e.g. torrent `ReadableStream`) and bdecodes it into the corresponding entity. This function internally uses a `TransformStream` called `Tokenizer` to tokenize the input `ReadableStream` and then calls `parse` function to parse the `Tokens`.

All `TransformStream`s used in this package are also exported.

### Supports a Comprehensive Set of Bcodec Friendly Javascript Types

Bcodec friendly Javascript types includes (for the time being):

| Bcodec Type \ Javascript Type |                                                           `Strict`                                                            |                                                                        `Loose`                                                                        |
| :---------------------------: | :---------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------: |
|         `ByteString`          |                                [`string`](https://developer.mozilla.org/docs/Glossary/String)                                 |                   `string` [`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)                    |
|           `Integer`           | [`number`](https://developer.mozilla.org/docs/Glossary/Number) [`bigint`](https://developer.mozilla.org/docs/Glossary/BigInt) |                                  `number` `bigint` [`boolean`](https://developer.mozilla.org/docs/Glossary/Boolean)                                   |
|            `List`             |                [`Strict[]`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)                 |                                                                       `Loose[]`                                                                       |
|         `Dictionary`          |        [`{[key: string]: Strict}`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)         | ` {[key: string]: Loose}` <br/> [`Map<string \| ArrayBuffer, Loose>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map) |
|            ignored            |                                                               -                                                               |                                                                  `undefined` `null`                                                                   |

`encode` function supports all `Loose` type inputs and `decode` function always returns `Strict` type results.

### Supports Hooks in Bencoding

You can register encoder hooks when using the `encode` function. A common use case is extracting the bencoded `info` dictionary and calculating the [`infohash`](http://bittorrent.org/beps/bep_0052.html#infohash). (This package doesn't provide an out-of-box function to calculate `infohash` for now)

To use encoder hooks, you will have to install the peer dependency [`@sec-ant/trie-map`](https://www.npmjs.com/package/@sec-ant/trie-map), which acts as an encoder hook system and allows you to register encoder hooks with iterable paths as keys in. Refer to its [README](https://github.com/Sec-ant/trie-map) to learn more about the package.

This package provides several helper functions to help you register hooks in a hook system and consume their results as you please: `useUint8ArrayStreamHook`, `useArrayBufferPromiseHook`, `useTextPromiseHook`. You can also define your own functions to handle hooks.

Here is probably how you should use this feature:

```ts
import { encode, EncoderHookSystem, useArrayBufferPromiseHook } from "torrefy";
import { TrieMap } from "@sec-ant/trie-map";

// create a dummy object to encode
const dummyObject = {
  a: "b",
  c: 1,
  info: {
    foo: "bar",
  },
  s: ["t"],
};

// initialize an encoder hook system
const hookSystem: EncoderHookSystem = new TrieMap();

// register an encoder hook under dummyObject.info path in the hook system
// and consume the result as an array buffer promise
const infoArrayBufferPromise = useArrayBufferPromiseHook(["info"], hookSystem);

// pass the hook system as an input argument to the encode function
const bencodedReadableStream = encode(dummyObject, hookSystem);

// consume the result of the hook
const infoArrayBuffer = await infoArrayBufferPromise; // => ArrayBuffer(12)
```
