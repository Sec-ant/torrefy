<div align="center">
<img width="200" src="https://user-images.githubusercontent.com/10386119/202842623-06e8ca3f-5761-41ed-9a8a-3a617b4e33a5.svg">
  <h1>torrefy</h1>
  <p>
    <img src="https://img.shields.io/github/languages/top/Sec-ant/torrefy" alt="GitHub top language"> <a href="https://www.npmjs.com/package/torrefy"><img src="https://img.shields.io/npm/v/torrefy" alt="npm version"></a> <a href="https://www.npmjs.com/package/torrefy"><img src="https://img.shields.io/npm/dm/torrefy" alt="npm downloads"></a> <a href="https://www.jsdelivr.com/package/npm/torrefy"><img src="https://data.jsdelivr.com/v1/package/npm/torrefy/badge?style=rounded" alt=""></a> <img src="https://img.shields.io/github/search/Sec-ant/torrefy/goto" alt="GitHub search hit counter"> <a href="https://openbase.com/js/torrefy?utm_source=embedded&amp;utm_medium=badge&amp;utm_campaign=rate-badge"><img src="https://badges.openbase.com/js/rating/torrefy.svg?token=SBYugeYmOxDXIoCFLx5bHr1urYSXTjmWD51wO5PzyH0=" alt="Rate this package"></a>
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

### Supports Different Web File APIs

This package can handle input files or directories acquired from [File API](https://developer.mozilla.org/docs/Web/API/File), [File and Directory Entries API](https://developer.mozilla.org/docs/Web/API/File_and_Directory_Entries_API) or [File System Access API](https://developer.mozilla.org/docs/Web/API/File_System_Access_API).

### TBD
