import { type TrieMap } from "@sec-ant/trie-map";
import { iterableSorter } from "../sync/iterableSorter.js";
import { nullishValueEliminator } from "../sync/nullishValueEliminator.js";
import {
  BByteString,
  BData,
  BList,
  BObject,
  BUFF_D,
  BUFF_E,
  BUFF_L,
} from "../../utils/codec.js";

type BDictionaryEntry = [BByteString<false>, BData<false>];

/**
 * encoder hook
 */
export type EncoderHook = (
  asyncIterable: AsyncIterable<Uint8Array>
) => void | Promise<void>;

/**
 * encoder hook path
 */
export type EncoderHookPath = Iterable<string | number>;

/**
 * encoder hook system
 */
export type EncoderHookSystem = TrieMap<EncoderHookPath, EncoderHook>;

/**
 * encoder options
 */
export interface EncoderOptions {
  hookSystem?: EncoderHookSystem;
}

export async function* encoder(
  data: BData<false>,
  { hookSystem }: EncoderOptions = {}
) {
  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();
  const path: (EncoderHookPath extends Iterable<infer PathElement>
    ? PathElement
    : never)[] = [];
  const dataStack: BData<false>[] = [data];
  const listIndexWeakMap = new WeakMap<BList<false>, number>();
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
    // map: dictionary start
    else if (currentData instanceof Map) {
      yield BUFF_D;
      const sortedDictionaryIterable = nullishValueEliminator(
        iterableSorter(currentData.entries(), {
          compareFunction: ([key1], [key2]) => {
            key1 = typeof key1 === "string" ? key1 : textDecoder.decode(key1);
            key2 = typeof key2 === "string" ? key2 : textDecoder.decode(key2);
            return key1 < key2 ? -1 : key1 > key2 ? 1 : 0;
          },
        })
      );
      sortedDictionaryIterableWeakSet.add(sortedDictionaryIterable);
      dataStack.pop();
      dataStack.push(sortedDictionaryIterable);
      // dummy key
      path.push(-1);
      continue;
    }
    // object: dictionary start
    else if (isBObject(currentData)) {
      yield BUFF_D;
      const sortedDictionaryIterable = nullishValueEliminator(
        iterableSorter(Object.entries(currentData), {
          compareFunction: ([key1], [key2]) => {
            key1 = typeof key1 === "string" ? key1 : textDecoder.decode(key1);
            key2 = typeof key2 === "string" ? key2 : textDecoder.decode(key2);
            return key1 < key2 ? -1 : key1 > key2 ? 1 : 0;
          },
        })
      );
      sortedDictionaryIterableWeakSet.add(sortedDictionaryIterable);
      dataStack.pop();
      dataStack.push(sortedDictionaryIterable);
      // dummy key
      path.push(-1);
      continue;
    }
    // sorted map iterable: dictionary follow
    else if (
      isBDictionaryEntries(currentData, sortedDictionaryIterableWeakSet)
    ) {
      // get current value
      const { value, done } = currentData[
        Symbol.iterator
      ]().next() as IteratorResult<BDictionaryEntry, undefined>;
      if (done) {
        path.pop();
        sortedDictionaryIterableWeakSet.delete(currentData);
        dataStack.pop();
        yield BUFF_E;
        continue;
      }
      const [k, v] = value;
      if (typeof k === "string") {
        path.pop();
        path.push(k);
        if (hookSystem) {
          const hook = hookSystem.get(path);
          hook && hook(encoder(v));
        }
      }
      dataStack.push(v, k);
      continue;
    }
    // array list
    else {
      // previous index
      const prevIndex = listIndexWeakMap.get(currentData) ?? -1;
      // first iteration
      if (prevIndex === -1) {
        yield BUFF_L;
        // dummy index
        path.push(-1);
      }
      // get current value
      const { value, done } = (
        Symbol.iterator in currentData
          ? currentData[Symbol.iterator]().next()
          : await currentData[Symbol.asyncIterator]().next()
      ) as IteratorResult<BData<false>, undefined>;
      // done
      if (done) {
        path.pop();
        listIndexWeakMap.delete(currentData);
        dataStack.pop();
        yield BUFF_E;
        continue;
      }
      // not done
      const index = prevIndex + 1;
      listIndexWeakMap.set(currentData, index);
      path.pop();
      path.push(index);
      if (hookSystem) {
        const hook = hookSystem.get(path);
        hook && hook(encoder(value));
      }
      dataStack.push(value);
      continue;
    }
  }
}

function isBObject(
  data: BList<false> | BObject<false>
): data is BObject<false> {
  return !(Symbol.iterator in data) && !(Symbol.asyncIterator in data);
}

function isBDictionaryEntries(
  data: BList<false>,
  sortedDictionaryIterableWeakSet: WeakSet<Iterable<BDictionaryEntry>>
): data is Iterable<BDictionaryEntry> {
  return sortedDictionaryIterableWeakSet.has(
    data as Iterable<BDictionaryEntry>
  );
}
