import { getSortedIndex } from "./utils";

export type BList = BData[];
export interface BObject {
  [k: string]: BData;
}
export type BMap = Map<ArrayBuffer | string, BData>;
export type BData =
  | boolean
  | number
  | bigint
  | string
  | ArrayBuffer
  | BList
  | BObject
  | BMap
  | undefined
  | null;

export type EncodeHookHandler = (result: IteratorResult<Uint8Array>) => void;

export interface EncodeHooks {
  [k: string]: EncodeHookHandler;
}
const isProxifiedController = Symbol("isProxifiedController");

declare global {
  interface ReadableStreamDefaultController {
    [isProxifiedController]: boolean | undefined;
  }
}

class BEncoderUnderlyingSource {
  textEncoder = new TextEncoder();
  textDecoder = new TextDecoder();
  buffL = new Uint8Array([108]);
  buffD = new Uint8Array([100]);
  buffE = new Uint8Array([101]);
  data: BData;
  hooks: EncodeHooks;
  constructor(data: BData, hooks: EncodeHooks) {
    this.data = data;
    this.hooks = hooks;
  }
  start(controller: ReadableStreamController<Uint8Array>) {
    this.encode(this.data, controller);
    controller.close();
  }
  encode(
    data: BData | undefined,
    controller: ReadableStreamController<Uint8Array>
  ) {
    if (typeof data === "undefined" || data === null) {
      return;
    }
    if (typeof data === "boolean") {
      this.encode(data ? 1 : 0, controller);
    } else if (typeof data === "number") {
      const integer = Math.round(data);
      controller.enqueue(this.textEncoder.encode(`i${integer}e`));
      if (integer !== data) {
        console.warn(
          `WARNING: Possible data corruption detected with value "${data}":`,
          `Bencoding only defines support for integers, value was converted to "${integer}"`
        );
        console.trace();
      }
    } else if (typeof data === "bigint") {
      controller.enqueue(this.textEncoder.encode(`i${data}e`));
    } else if (typeof data === "string") {
      const byteData = this.textEncoder.encode(data);
      const byteLength = byteData.byteLength;
      controller.enqueue(this.textEncoder.encode(`${byteLength}:`));
      controller.enqueue(byteData);
    } else if (data instanceof ArrayBuffer) {
      const byteData = new Uint8Array(data);
      const byteLength = byteData.byteLength;
      controller.enqueue(this.textEncoder.encode(`${byteLength}:`));
      controller.enqueue(byteData);
    } else if (Array.isArray(data)) {
      controller.enqueue(this.buffL);
      for (let member of data) {
        this.encode(member, controller);
      }
      controller.enqueue(this.buffE);
    } else if (data instanceof Map) {
      controller.enqueue(this.buffD);
      const keys: (string | ArrayBuffer)[] = [];
      for (const key of data.keys()) {
        keys.splice(
          getSortedIndex(keys, key, (a, b) => {
            a = typeof a === "string" ? a : this.textDecoder.decode(a);
            b = typeof b === "string" ? b : this.textDecoder.decode(b);
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
        this.encode(key, controller);
        if (
          typeof key === "string" &&
          key in this.hooks &&
          !controller[isProxifiedController]
        ) {
          const hookHandler = this.hooks[key];
          this.encode(value, proxifyController(controller, hookHandler));
          hookHandler({
            value: undefined,
            done: true,
          });
        } else {
          this.encode(value, controller);
        }
      }
      controller.enqueue(this.buffE);
    } else {
      controller.enqueue(this.buffD);
      const keys = Object.keys(data).sort();
      for (const key of keys) {
        const value = data[key];
        if (typeof value === "undefined" || data === null) {
          continue;
        }
        this.encode(key, controller);
        if (key in this.hooks && !controller[isProxifiedController]) {
          const hookHandler = this.hooks[key];
          this.encode(value, proxifyController(controller, hookHandler));
          hookHandler({
            value: undefined,
            done: true,
          });
        } else {
          this.encode(value, controller);
        }
      }
      controller.enqueue(this.buffE);
    }
  }
}

export function encode(data: BData, hooks: EncodeHooks = {}) {
  return new ReadableStream(new BEncoderUnderlyingSource(data, hooks));
}

function proxifyController(
  controller: ReadableStreamDefaultController<Uint8Array>,
  hookHandler: EncodeHookHandler
) {
  return new Proxy(controller, {
    get: function (target, prop, receiver) {
      if (prop === "enqueue") {
        return ((chunk?: Uint8Array | undefined) => {
          target.enqueue(chunk);
          if (chunk !== undefined) {
            hookHandler({
              value: chunk,
              done: false,
            });
          }
        }).bind(target);
      } else if (prop === isProxifiedController) {
        return true;
      } else {
        return Reflect.get(target, prop, receiver);
      }
    },
  });
}
