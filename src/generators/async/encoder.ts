import { type TrieMap } from "@sec-ant/trie-map";
import { iterableSorter } from "../sync/iterableSorter.js";
import { nullishValueDropper } from "../sync/nullishValueDropper.js";
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

type BDictionaryEntryIterator = Iterator<BDictionaryEntry, void>;

type BDataIterator =
  | Iterator<BData<false>, void, undefined>
  | AsyncIterator<BData<false>, void, undefined>;

interface BDictionaryState {
  iterator: BDictionaryEntryIterator;
}

interface BListState {
  iterator: BDataIterator;
  index: number;
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
  const bDictionaryWeakMap = new WeakMap<
    Iterable<BDictionaryEntry>,
    BDictionaryState
  >();
  const bListWeakMap = new WeakMap<BList<false>, BListState>();
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
      // sort
      const sortedDictionaryIterable = nullishValueDropper(
        iterableSorter(currentData.entries(), {
          compareFunction: ([key1], [key2]) => {
            key1 = typeof key1 === "string" ? key1 : textDecoder.decode(key1);
            key2 = typeof key2 === "string" ? key2 : textDecoder.decode(key2);
            return key1 < key2 ? -1 : key1 > key2 ? 1 : 0;
          },
        })
      );
      // register
      bDictionaryWeakMap.set(sortedDictionaryIterable, {
        iterator: sortedDictionaryIterable[Symbol.iterator](),
      });
      // replace with sorted iterable
      dataStack.pop();
      dataStack.push(sortedDictionaryIterable);
      // dummy key
      path.push(-1);
      continue;
    }
    // object: dictionary start
    else if (isBObject(currentData)) {
      yield BUFF_D;
      // sort
      const sortedDictionaryIterable = nullishValueDropper(
        iterableSorter(Object.entries(currentData), {
          compareFunction: ([key1], [key2]) => {
            key1 = typeof key1 === "string" ? key1 : textDecoder.decode(key1);
            key2 = typeof key2 === "string" ? key2 : textDecoder.decode(key2);
            return key1 < key2 ? -1 : key1 > key2 ? 1 : 0;
          },
        })
      );
      // register
      bDictionaryWeakMap.set(sortedDictionaryIterable, {
        iterator: sortedDictionaryIterable[Symbol.iterator](),
      });
      // replace with sorted iterable
      dataStack.pop();
      dataStack.push(sortedDictionaryIterable);
      // dummy key
      path.push(-1);
      continue;
    }
    // sorted map iterable: dictionary follow
    else if (isBDictionaryEntries(currentData, bDictionaryWeakMap)) {
      const currentIterator = (
        bDictionaryWeakMap.get(currentData) as BDictionaryState
      ).iterator;
      // get current value
      const { value, done } = currentIterator.next();
      // done
      if (done) {
        path.pop();
        bDictionaryWeakMap.delete(currentData);
        dataStack.pop();
        yield BUFF_E;
        continue;
      }
      // not done
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
      // get state
      let state = bListWeakMap.get(currentData);
      // first access
      if (!state) {
        state = {
          iterator:
            Symbol.iterator in currentData
              ? currentData[Symbol.iterator]()
              : currentData[Symbol.asyncIterator](),
          index: -1,
        };
        bListWeakMap.set(currentData, state);
        // start
        yield BUFF_L;
        // dummy index
        path.push(-1);
      }
      const currentIterator = state.iterator;
      // get current value
      const { value, done } = await currentIterator.next();
      // done
      if (done) {
        path.pop();
        bListWeakMap.delete(currentData);
        dataStack.pop();
        yield BUFF_E;
        continue;
      }
      // not done
      state.index = state.index + 1;
      path.pop();
      path.push(state.index);
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
  bDictionaryWeakMap: WeakMap<Iterable<BDictionaryEntry>, BDictionaryState>
): data is Iterable<BDictionaryEntry> {
  return bDictionaryWeakMap.has(data as Iterable<BDictionaryEntry>);
}
