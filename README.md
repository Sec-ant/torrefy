## This package is still under heavy development. APIs are prone to change. Use with caution!!

<div align="center">
<img width="200" src="https://user-images.githubusercontent.com/10386119/200158861-0398b9ce-35f6-4516-a79e-95ed1772b10b.svg">
  <h1>torrefy</h1>
  <p>
    An <a href="https://developer.mozilla.org/docs/Web/JavaScript/Guide/Modules">ESM</a> package that uses <a href="https://developer.mozilla.org/docs/Web/API/Streams_API">Web Streams API</a> to create v1, v2 or hybrid torrents in your web browser
  </p>
</div>

## Install

```bash
npm i torrefy # or yarn add torrefy
```

## Usage

### Basic usage

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

### Advance usage

```ts
import {
  create,
  encode,
  decode,
  CommonPieceLength,
  TorrentType,
  TorrentOptions,
  OnProgress,
  TrieMap,
  useArrayBufferPromiseHook,
  useTextPromiseHook,
} from "torrefy";

// create a test file
const testFile = new File(
  ["Hello world. This is the test file content."],
  "testfile.txt"
);

// v1 torrent options
const options: TorrentOptions<TorrentType.V1> = {
  type: TorrentType.V1,
  announceList: [
    ["udp://tracker.opentrackr.org:1337/announce"],
    ["udp://9.rarbg.com:2810/announce"],
  ],
  pieceLength: CommonPieceLength["16KB"],
};

// handle progress
const handleProgress: OnProgress = (current, total) => {
  console.log(((current / total) * 100).toFixed(2) + "%");
};

// calculate (hash) the meta info of the test file
const metaInfo = await create([testFile], options, handleProgress);

// use hooks when bencoding
const hooks = new TrieMap();

// declare hook result as an array buffer promise
const [infoPromise, updateInfo] = useArrayBufferPromiseHook();
// register the above hook under "info" path
hooks.set(["info"], updateInfo);

// declare hook result as a text promise
const [piecesPromise, updatePieces] = useTextPromiseHook();
// register the above hook under "info.pieces" path
hooks.set(["info", "pieces"], updatePieces);

// bencode meta info into a readable stream with registered hooks
const torrentStream = encode(metaInfo, hooks);

// tee the readable stream into two readable streams
const [torrentStream1, torrentStream2] = torrentStream.tee();

// consume the first readable stream as an array buffer
const torrentBinary = await new Response(torrentStream1).arrayBuffer();

// get bencoded "info" as an array buffer
const info = await infoPromise;

// get bencoded "info.pieces" as a piece of text
const pieces = await piecesPromise;

// decode the second readable stream into meta info
const decodedMetaInfo = await decode(torrentStream2);
```

## Todos

- [x] BDecode implementation
- [ ] Magnet URI scheme (should be trivial)
- [ ] Convert all `makeXXXTransformStream` functional closure states to [`transformer`](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream/TransformStream#:~:text=Parameters-,transformer,-Optional) class states (should be trivial)
- [ ] Convert typescript `Enum`s to `Union`s (need investigation)
- [ ] Other type related issues (need investigation)
- [ ] Bundleless entry (need investigation)
- [ ] Support other common BEPs (need investigation)
- [ ] Add tests
- [ ] Add demo page
