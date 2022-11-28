import { iterableSort } from "../index.js";
import { iterableSorter } from "../syncGenerators/iterableSorter.js";
import {
  BByteString,
  BData,
  BDictionary,
  BList,
  BMap,
  BObject,
  BUFF_D,
  BUFF_E,
  BUFF_L,
} from "../utils/codec.js";

type BDictionaryEntry = [BByteString<false>, BData<false>];

export type EncoderHookPath = Iterable<string | number>;

export async function* encoder(data: BData<false>) {
  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();
  const path: (EncoderHookPath extends Iterable<infer PathElement>
    ? PathElement
    : never)[] = [];
  const dataStack: BData<false>[] = [data];
  const indexWeakMap = new WeakMap<BList<false>, number>();
  const sortedDictionaryIterableWeakSet = new WeakSet<
    Iterable<BDictionaryEntry>
  >();
  while (dataStack.length) {
    const currentData = dataStack.at(-1);
    // undefined or null: ignore
    if (typeof currentData === "undefined" || currentData === null) {
      dataStack.pop();
      continue;
    }
    // boolean: integer
    else if (typeof currentData === "boolean") {
      dataStack.pop();
      dataStack.push(currentData ? 1 : 0);
      continue;
    }
    // number: integer
    else if (typeof currentData === "number") {
      let integer: number;
      if (Number.isInteger(currentData)) {
        integer = currentData;
      } else {
        integer = Math.round(currentData);
        console.warn(
          `WARNING: Possible data corruption detected with value "${currentData}":`,
          `Bencoding only defines support for integers, value was converted to "${integer}"`
        );
      }
      yield textEncoder.encode(`i${integer}e`);
      dataStack.pop();
      continue;
    }
    // bigint: integer
    else if (typeof currentData === "bigint") {
      yield textEncoder.encode(`i${currentData}e`);
      dataStack.pop();
      continue;
    }
    // string: byte string
    else if (typeof currentData === "string") {
      const byteData = textEncoder.encode(currentData);
      const byteLength = byteData.byteLength;
      yield textEncoder.encode(`${byteLength}:`);
      yield byteData;
      dataStack.pop();
      continue;
    }
    // array buffer: byte string
    else if (currentData instanceof ArrayBuffer) {
      const byteData = new Uint8Array(currentData);
      const byteLength = byteData.byteLength;
      yield textEncoder.encode(`${byteLength}:`);
      yield byteData;
      dataStack.pop();
      continue;
    }
    // array list
    else if (
      !(currentData instanceof Map) &&
      isSyncOrAsyncIterable(currentData) &&
      !sortedDictionaryIterableWeakSet.has(
        currentData as Iterable<BDictionaryEntry>
      )
    ) {
      // get current value
      const { value, done } = (
        Symbol.iterator in currentData
          ? currentData[Symbol.iterator]().next()
          : await currentData[Symbol.asyncIterator]().next()
      ) as IteratorResult<BData<false>, undefined>;
      // previous index
      const prevIndex = indexWeakMap.get(currentData);
      // current index
      let index: number;
      // first iteration
      if (typeof prevIndex === "undefined") {
        yield BUFF_L;
        // empty list end
        if (done) {
          yield BUFF_E;
          dataStack.pop();
          continue;
        }
        // non-empty list start
        index = 0;
      }
      // consecutive iteration
      else {
        path.pop();
        // non-empty list end
        if (done) {
          indexWeakMap.delete(currentData);
          yield BUFF_E;
          dataStack.pop();
          continue;
        }
        // non-empty list follow
        index = prevIndex + 1;
      }
      indexWeakMap.set(currentData, index);
      path.push(index);
      dataStack.push(value);
      continue;
    }
    // map: dictionary start
    else if (currentData instanceof Map) {
      yield BUFF_D;
      const sortedBMapIterable = iterableSorter(currentData.entries(), {
        compareFunction: ([key1], [key2]) => {
          key1 = typeof key1 === "string" ? key1 : textDecoder.decode(key1);
          key2 = typeof key2 === "string" ? key2 : textDecoder.decode(key2);
          return key1 < key2 ? -1 : key1 > key2 ? 1 : 0;
        },
      });
      sortedDictionaryIterableWeakSet.add(sortedBMapIterable);
      dataStack.pop();
      dataStack.push(sortedBMapIterable);
      continue;
    }
    // object: dictionary start
    else if (
      !(Symbol.iterator in currentData) &&
      !(Symbol.asyncIterator in currentData)
    ) {
      yield BUFF_D;
      const sortedBMapIterable = iterableSorter(Object.entries(currentData), {
        compareFunction: ([key1], [key2]) => {
          key1 = typeof key1 === "string" ? key1 : textDecoder.decode(key1);
          key2 = typeof key2 === "string" ? key2 : textDecoder.decode(key2);
          return key1 < key2 ? -1 : key1 > key2 ? 1 : 0;
        },
      });
      sortedDictionaryIterableWeakSet.add(sortedBMapIterable);
      dataStack.pop();
      dataStack.push(sortedBMapIterable);
      continue;
    }
    // sorted map iterable: dictionary follow
    else if (
      Symbol.iterator in currentData &&
      sortedDictionaryIterableWeakSet.has(
        currentData as Iterable<BDictionaryEntry>
      )
    ) {
      // get current value
      const { value, done } = currentData[
        Symbol.iterator
      ]().next() as IteratorResult<BDictionaryEntry, undefined>;
      if (done) {
      } else {
        const [key, v] = value;
      }
    }
  }
}

function isSyncOrAsyncIterable(data: BData<false>): data is BList<false> {
  return (
    (typeof data === "function" || typeof data === "object") &&
    data !== null &&
    ((Symbol.iterator in data && typeof data[Symbol.iterator] === "function") ||
      (Symbol.asyncIterator in data &&
        typeof data[Symbol.asyncIterator] === "function"))
  );
}
