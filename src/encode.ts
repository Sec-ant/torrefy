import ArrayKeyedMap from "array-keyed-map";
export { default as ArrayKeyedMap } from "array-keyed-map";
import { iterableSort } from "./utils.js";
/**
 * bencode list
 */
export type BList = BData[];

/**
 * bencode object (as dictionary)
 */
export interface BObject {
  [k: string]: BData;
}

/**
 * bencode map (as dictionary)
 */
export type BMap = Map<ArrayBuffer | string, BData>;

/**
 * allowed bencode data
 */
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

/**
 * encode hook handler
 */
export type EncodeHookHandler = (
  result: IteratorResult<Uint8Array, undefined>
) => void;

/**
 * encoder hooks
 */
type EncoderHooks = ArrayKeyedMap<(string | ArrayBuffer)[], EncodeHookHandler>;

/**
 * bencode token: l (stands for list start)
 */
export const BUFF_L = new Uint8Array([108]);

/**
 * bencode token: d (stands for dictionary start)
 */
export const BUFF_D = new Uint8Array([100]);

/**
 * bencode token: e (stands for end)
 */
export const BUFF_E = new Uint8Array([101]);

/**
 * bencode readablestream underlying source
 */
class BEncoderUnderlyingSource implements UnderlyingSource<Uint8Array> {
  textEncoder = new TextEncoder();
  textDecoder = new TextDecoder();
  data: BData;
  hooks: EncoderHooks | undefined;
  isHooking = false;
  path: (string | ArrayBuffer)[] = [];
  constructor(data: BData, hooks?: EncoderHooks) {
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
    // undefined or null: return
    if (typeof data === "undefined" || data === null) {
      return;
    }
    // boolean: 0 or 1
    if (typeof data === "boolean") {
      this.encode(data ? 1 : 0, controller);
    }
    // number: integer
    else if (typeof data === "number") {
      const integer = Math.round(data);
      controller.enqueue(this.textEncoder.encode(`i${integer}e`));
      if (integer !== data) {
        console.warn(
          `WARNING: Possible data corruption detected with value "${data}":`,
          `Bencoding only defines support for integers, value was converted to "${integer}"`
        );
        console.trace();
      }
    }
    // bigint: integer
    else if (typeof data === "bigint") {
      controller.enqueue(this.textEncoder.encode(`i${data}e`));
    }
    // string: string
    else if (typeof data === "string") {
      const byteData = this.textEncoder.encode(data);
      const byteLength = byteData.byteLength;
      controller.enqueue(this.textEncoder.encode(`${byteLength}:`));
      controller.enqueue(byteData);
    }
    // array buffer: string
    else if (data instanceof ArrayBuffer) {
      const byteData = new Uint8Array(data);
      const byteLength = byteData.byteLength;
      controller.enqueue(this.textEncoder.encode(`${byteLength}:`));
      controller.enqueue(byteData);
    }
    // array: list
    else if (Array.isArray(data)) {
      controller.enqueue(BUFF_L);
      for (let member of data) {
        this.encode(member, controller);
      }
      controller.enqueue(BUFF_E);
    }
    // map: dictionary
    else if (data instanceof Map) {
      controller.enqueue(BUFF_D);
      // sort keys order
      const keys = iterableSort(data.keys(), (a, b) => {
        a = typeof a === "string" ? a : this.textDecoder.decode(a);
        b = typeof b === "string" ? b : this.textDecoder.decode(b);
        return a < b ? -1 : a > b ? 1 : 0;
      });
      // iterate keys
      for (const key of keys) {
        const value = data.get(key);
        // ignore nullables
        if (typeof value === "undefined" || data === null) {
          continue;
        }
        // push path
        this.path.push(key);
        // encode key
        this.encode(key, controller);
        // if hooks are registered
        if (this.hooks) {
          const hookHandler = this.hooks.get(this.path);
          if (hookHandler) {
            const newController = addHandler(controller, hookHandler);
            this.encode(value, newController);
            hookHandler({ value: undefined, done: true });
          } else {
            this.encode(value, controller);
          }
        }
        // pop path
        this.path.pop();
      }
      controller.enqueue(BUFF_E);
    }
    // object: dictionary
    else {
      controller.enqueue(BUFF_D);
      const keys = Object.keys(data).sort();
      for (const key of keys) {
        const value = data[key];
        if (typeof value === "undefined" || data === null) {
          continue;
        }
        // push path
        this.path.push(key);
        // encode key
        this.encode(key, controller);
        // if hooks are registered
        if (this.hooks) {
          const hookHandler = this.hooks.get(this.path);
          if (hookHandler) {
            const newController = addHandler(controller, hookHandler);
            this.encode(value, newController);
            hookHandler({ value: undefined, done: true });
          } else {
            this.encode(value, controller);
          }
        }
        // pop path
        this.path.pop();
      }
      controller.enqueue(BUFF_E);
    }
  }
}

/**
 * BEncode
 * @param data
 * @param hooks
 * @returns readable stream of the bencoded data
 */
export function encode(data: BData, hooks?: EncoderHooks) {
  return new ReadableStream(new BEncoderUnderlyingSource(data, hooks));
}

/**
 * Add handler to controller
 * @param controller
 * @param hookHandler
 * @returns
 */
function addHandler(
  controller: ReadableStreamDefaultController<Uint8Array>,
  hookHandler: EncodeHookHandler
) {
  const newController = new Proxy(controller, {
    get: function (target, prop, receiver) {
      if (prop !== "enqueue") {
        return Reflect.get(target, prop, receiver);
      }
      return ((chunk?: Uint8Array | undefined) => {
        target.enqueue(chunk);
        if (chunk === undefined) {
          return;
        }
        hookHandler({
          value: chunk,
          done: false,
        });
      }).bind(target);
    },
  });
  return newController;
}

/**
 * Get a uint8 array stream hook handler
 * @returns a uint8 array readable stream and a hook handler
 */
export function useUint8ArrayStreamHook(): [
  ReadableStream<Uint8Array>,
  EncodeHookHandler
] {
  const ref = {
    controller: null as ReadableStreamDefaultController<Uint8Array> | null,
  };

  const hookHandler = ({
    value,
    done,
  }: IteratorResult<Uint8Array, undefined>) => {
    if (ref.controller === null) {
      return;
    }
    if (!done) {
      ref.controller.enqueue(value);
    } else {
      ref.controller.close();
    }
  };

  const readableStream = new ReadableStream<Uint8Array>({
    start(controller) {
      ref.controller = controller;
    },
  });

  return [readableStream, hookHandler];
}

/**
 * Get an array buffer promise hook handler
 * @returns an array buffer promise and a hook handler
 */
export function useArrayBufferPromiseHook(): [
  Promise<ArrayBuffer>,
  EncodeHookHandler
] {
  const [readableStream, hookHandler] = useUint8ArrayStreamHook();
  const arrayBufferPromise = new Response(readableStream).arrayBuffer();
  return [arrayBufferPromise, hookHandler];
}

/**
 * Get an text promise hook handler
 * @returns an text promise and a hook handler
 */
export function useTextPromiseHook(): [Promise<string>, EncodeHookHandler] {
  const [readableStream, hookHandler] = useUint8ArrayStreamHook();
  const textPromise = new Response(readableStream).text();
  return [textPromise, hookHandler];
}
