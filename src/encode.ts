import { TrieMap } from "@sec-ant/trie-map";
import { BData, BUFF_L, BUFF_E, BUFF_D } from "./utils/codec.js";
import { iterableSort } from "./utils/misc.js";

/**
 * encode hook handler
 */
export type EncoderHookHandler = (
  result: IteratorResult<Uint8Array, undefined>
) => void;

/**
 * encoder hooks
 */
export type EncoderHooks = TrieMap<
  Iterable<string | number>,
  EncoderHookHandler
>;

const consumedHooks = new WeakMap<EncoderHooks, boolean>();

/**
 * bencode readablestream underlying source
 */
class EncoderUnderlyingSource implements UnderlyingSource<Uint8Array> {
  textEncoder = new TextEncoder();
  textDecoder = new TextDecoder();
  data: BData<false>;
  path: (string | number)[] = [];
  hooks?: EncoderHooks;
  consumedHookHandler = new WeakMap<EncoderHookHandler, boolean>();
  constructor(data: BData<false>, hooks?: EncoderHooks) {
    this.data = data;
    this.hooks = hooks;
    if (hooks) {
      consumedHooks.set(hooks, true);
    }
  }
  start(controller: ReadableStreamController<Uint8Array>) {
    this.encode(this.data, controller);
    if (this.hooks) {
      for (const hookHandler of this.hooks.values()) {
        // only done once, in case of closing controller twice
        if (!this.consumedHookHandler.get(hookHandler)) {
          hookHandler({ value: undefined, done: true });
        }
      }
    }
    controller.close();
  }
  encode(data: BData<false>, controller: ReadableStreamController<Uint8Array>) {
    // undefined or null: return
    if (typeof data === "undefined" || data === null) {
      return;
    }
    // boolean: integer
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
    // string: byte string
    else if (typeof data === "string") {
      const byteData = this.textEncoder.encode(data);
      const byteLength = byteData.byteLength;
      controller.enqueue(this.textEncoder.encode(`${byteLength}:`));
      controller.enqueue(byteData);
    }
    // array buffer: byte string
    else if (data instanceof ArrayBuffer) {
      const byteData = new Uint8Array(data);
      const byteLength = byteData.byteLength;
      controller.enqueue(this.textEncoder.encode(`${byteLength}:`));
      controller.enqueue(byteData);
    }
    // array: list
    else if (Array.isArray(data)) {
      controller.enqueue(BUFF_L);
      let counter = 0;
      for (const member of data) {
        // push path
        this.path.push(counter);
        // if hooks are registered
        if (this.hooks) {
          const hookHandler = this.hooks.get(this.path);
          if (hookHandler) {
            const newController = addHandler(controller, hookHandler);
            this.encode(member, newController);
            hookHandler({ value: undefined, done: true });
          } else {
            this.encode(member, controller);
          }
        }
        // pop path
        this.path.pop();
        ++counter;
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
        if (key instanceof ArrayBuffer) {
          this.encode(key, controller);
          this.encode(value, controller);
        } else {
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
              this.consumedHookHandler.set(hookHandler, true);
            } else {
              this.encode(value, controller);
            }
          }
          // pop path
          this.path.pop();
        }
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
            this.consumedHookHandler.set(hookHandler, true);
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
export function encode(data: BData<false>, hooks?: EncoderHooks) {
  return new ReadableStream(new EncoderUnderlyingSource(data, hooks));
}

/**
 * Add handler to controller
 * @param controller
 * @param hookHandler
 * @returns
 */
function addHandler(
  controller: ReadableStreamController<Uint8Array>,
  hookHandler: EncoderHookHandler
) {
  const newController = new Proxy(controller, {
    get: function (target, prop, receiver) {
      switch (prop) {
        case "enqueue":
          return ((chunk: Uint8Array) => {
            target.enqueue(chunk);
            hookHandler({
              value: chunk,
              done: false,
            });
          }).bind(target);
        default:
          return Reflect.get(target, prop, receiver) as unknown;
      }
    },
  });
  return newController;
}

/**
 * Get a uint8 array stream hook handler
 * @returns a uint8 array readable stream
 */
export function useUint8ArrayStreamHook(
  path: Iterable<string>,
  hooks: EncoderHooks
): [ReadableStream<Uint8Array>] {
  const ref = {
    controller: null as ReadableStreamController<Uint8Array> | null,
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
    pull(controller) {
      if (!consumedHooks.get(hooks)) {
        // prevent endless awaiting when this readable stream is consumed as promise
        console.warn("You need to call encode() first and then consume hooks.");
        controller.close();
        ref.controller = null;
      }
    },
  });

  hooks.set(path, hookHandler);

  return [readableStream];
}

/**
 * Get an array buffer promise hook handler
 * @returns an array buffer
 */
export function useArrayBufferPromiseHook(
  path: Iterable<string>,
  hooks: EncoderHooks
): [Promise<ArrayBuffer>] {
  const [readableStream] = useUint8ArrayStreamHook(path, hooks);
  const arrayBufferPromise = new Response(readableStream).arrayBuffer();
  return [arrayBufferPromise];
}

/**
 * Get an text promise hook handler
 * @returns an text promise
 */
export function useTextPromiseHook(
  path: Iterable<string>,
  hooks: EncoderHooks
): [Promise<string>] {
  const [readableStream] = useUint8ArrayStreamHook(path, hooks);
  const textPromise = new Response(readableStream).text();
  return [textPromise];
}
