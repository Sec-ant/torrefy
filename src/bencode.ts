import { getSortedIndex } from "./utils";
export type BList = BData[];
export interface BObject {
  [k: string]: BData;
}
export type BMap = Map<ArrayBuffer | string, BData>;
export type BData =
  | number
  | bigint
  | string
  | ArrayBuffer
  | BList
  | BObject
  | BMap
  | undefined;

class BEncoderUnderlyingSource {
  #textEncoder = new TextEncoder();
  #textDecoder = new TextDecoder();
  #buffL = this.#textEncoder.encode("l");
  #buffD = this.#textEncoder.encode("d");
  #buffE = this.#textEncoder.encode("e");
  #data: BData;
  constructor(data: BData) {
    this.#data = data;
  }
  start(controller: ReadableStreamController<Uint8Array>) {
    this.#encode(this.#data, controller);
    controller.close();
  }
  #encode(
    data: BData | undefined,
    controller: ReadableStreamController<Uint8Array>
  ) {
    if (typeof data === "undefined" || data === null) {
      return;
    }
    } else if (typeof data === "number") {
      const integer = Math.round(data);
      controller.enqueue(this.#textEncoder.encode(`i${integer}e`));
      if (integer !== data) {
        console.warn(
          `WARNING: Possible data corruption detected with value "${data}":`,
          `Bencoding only defines support for integers, value was converted to "${integer}"`
        );
        console.trace();
      }
    } else if (typeof data === "bigint") {
      controller.enqueue(this.#textEncoder.encode(`i${data}e`));
    } else if (typeof data === "string") {
      const byteData = this.#textEncoder.encode(data);
      const byteLength = byteData.byteLength;
      controller.enqueue(this.#textEncoder.encode(`${byteLength}:`));
      controller.enqueue(byteData);
    } else if (data instanceof ArrayBuffer) {
      const byteData = new Uint8Array(data);
      const byteLength = byteData.byteLength;
      controller.enqueue(this.#textEncoder.encode(`${byteLength}:`));
      controller.enqueue(byteData);
    } else if (Array.isArray(data)) {
      controller.enqueue(this.#buffL);
      for (let member of data) {
        this.#encode(member, controller);
      }
      controller.enqueue(this.#buffE);
    } else if (data instanceof Map) {
      controller.enqueue(this.#buffD);
      const keys: (string | ArrayBuffer)[] = [];
      for (const key of data.keys()) {
        keys.splice(
          getSortedIndex(keys, key, (a, b) => {
            a = typeof a === "string" ? a : this.#textDecoder.decode(a);
            b = typeof b === "string" ? b : this.#textDecoder.decode(b);
            return a < b ? -1 : a > b ? 1 : 0;
          }),
          0,
          key
        );
      }
      for (const key of keys) {
        const value = data.get(key);
        if (typeof value === "undefined" || data === null) {
          continue;
        }
        this.#encode(key, controller);
        this.#encode(value, controller);
      }
      controller.enqueue(this.#buffE);
    } else {
      controller.enqueue(this.#buffD);
      const keys = Object.keys(data).sort();
      for (const key of keys) {
        const value = data[key];
        if (typeof value === "undefined" || data === null) {
          continue;
        }
        this.#encode(key, controller);
        this.#encode(value, controller);
      }
      controller.enqueue(this.#buffE);
    }
  }
}

export function encode(data: BData) {
  return new ReadableStream(new BEncoderUnderlyingSource(data));
}
