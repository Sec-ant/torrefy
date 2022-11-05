<div align="center">
<img width="200" src="https://user-images.githubusercontent.com/10386119/200105371-05832afe-ec19-4373-988c-40c9fa3cf9e7.svg">
  <h1>torrefy</h1>
  <p>
    create v1, v2 or hybrid torrents in your browser
  </p>
</div>

## Usage

### Basic usage

```ts
import {
  create,
  encode,
  CommonPieceLength,
  TorrentType,
  TorrentOptionsV1,
  OnProgress,
  ArrayKeyedMap,
  useArrayBufferPromiseHook,
  useTextPromiseHook,
} from "torrefy";

// create a test file
const testFile = new File(
  ["Hello world. This is the test file content."],
  "testfile.txt"
);

// v1 torrent options
const options: TorrentOptionsV1 = {
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
const hooks = new ArrayKeyedMap();

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
// consume the readable stream as an array buffer
const torrentBinary = await new Response(torrentStream).arrayBuffer();

// get bencoded "info" as an array buffer
const info = await infoPromise;

// get bencoded "info.pieces" as a piece of text
const pieces = await piecesPromise;
```
