import { TrieMap } from "@sec-ant/trie-map";
import { BData, BUFF_L, BUFF_E, BUFF_D } from "./utils/codec.js";
import { iterableSort } from "./utils/misc.js";

/**
 * encoder hook
 */
export type EncoderHook = (
  result: IteratorResult<Uint8Array, undefined>
) => void;

/**
 * encoder hook path
 */
export type EncoderHookPath = Iterable<string | number>;

/**
 * encoder hook system
 */
export type EncoderHookSystem = TrieMap<EncoderHookPath, EncoderHook>;

/**
 * a global weakmap that keeps all consumed hook systems, for internal use
 */
const consumedHookSystems = new WeakMap<EncoderHookSystem, boolean>();

/**
 * bencode readable stream underlying source
 */
class EncoderUnderlyingSource implements UnderlyingSource<Uint8Array> {
  textEncoder = new TextEncoder();
  textDecoder = new TextDecoder();
  data: BData<false>;
  path: (EncoderHookPath extends Iterable<infer PathElement>
    ? PathElement
    : never)[] = [];
  hookSystem?: EncoderHookSystem;
  attachedHooks = new WeakMap<EncoderHook, boolean>();
  constructor(data: BData<false>, hookSystem?: EncoderHookSystem) {
    this.data = data;
    this.hookSystem = hookSystem;
    if (hookSystem) {
      consumedHookSystems.set(hookSystem, true);
    }
  }
  start(controller: ReadableStreamController<Uint8Array>) {
    this.encode(this.data, controller);
    // wind up
    if (this.hookSystem) {
      for (const hook of this.hookSystem.values()) {
        // only done once, in case of closing controller twice
        if (!this.attachedHooks.get(hook)) {
          hook({ value: undefined, done: true });
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
        // if hook system is provided
        let hook: EncoderHook | undefined;
        if (this.hookSystem && (hook = this.hookSystem.get(this.path))) {
          const newController = attachHook(controller, hook);
          this.encode(member, newController);
          hook({ value: undefined, done: true });
          this.attachedHooks.set(hook, true);
        } else {
          this.encode(member, controller);
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
          // if hook system is provided
          let hook: EncoderHook | undefined;
          if (this.hookSystem && (hook = this.hookSystem.get(this.path))) {
            const newController = attachHook(controller, hook);
            this.encode(value, newController);
            hook({ value: undefined, done: true });
            this.attachedHooks.set(hook, true);
          } else {
            this.encode(value, controller);
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
        // if hook system is provided
        let hook: EncoderHook | undefined;
        if (this.hookSystem && (hook = this.hookSystem.get(this.path))) {
          const newController = attachHook(controller, hook);
          this.encode(value, newController);
          hook({ value: undefined, done: true });
          this.attachedHooks.set(hook, true);
        } else {
          this.encode(value, controller);
        }
        // pop path
        this.path.pop();
      }
      controller.enqueue(BUFF_E);
    }
  }
}

/**
 * Bencode
 * @param data
 * @param hookSystem
 * @returns readable stream of the bencoded data
 */
export function encode(data: BData<false>, hookSystem?: EncoderHookSystem) {
  return new ReadableStream(new EncoderUnderlyingSource(data, hookSystem));
}

/**
 * Attach hook to controller
 * @param controller
 * @param hook
 * @returns
 */
function attachHook(
  controller: ReadableStreamController<Uint8Array>,
  hook: EncoderHook
) {
  const newController = new Proxy(controller, {
    get: function (target, prop, receiver) {
      switch (prop) {
        case "enqueue":
          return ((chunk: Uint8Array) => {
            target.enqueue(chunk);
            hook({
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
 * Register a hook and consume the result as an uint8 array readable stream
 * @param path
 * @param hookSystem
 * @returns an uint8 array readable stream
 */
export function useUint8ArrayStreamHook(
  path: EncoderHookPath,
  hookSystem: EncoderHookSystem
): ReadableStream<Uint8Array> {
  const ref = {
    controller: null as ReadableStreamController<Uint8Array> | null,
  };

  const hook = ({ value, done }: IteratorResult<Uint8Array, undefined>) => {
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
      if (!consumedHookSystems.get(hookSystem)) {
        // prevent endless awaiting when this readable stream is consumed as promise
        console.warn("You need to call encode() first and then consume hooks.");
        controller.close();
        ref.controller = null;
      }
    },
  });

  // register hook in hook system
  hookSystem.set(path, hook);

  return readableStream;
}

/**
 * Register a hook and consume the result as an array buffer promise
 * @param path
 * @param hookSystem
 * @returns an array buffer promise
 */
export function useArrayBufferPromiseHook(
  path: EncoderHookPath,
  hookSystem: EncoderHookSystem
): Promise<ArrayBuffer> {
  const readableStream = useUint8ArrayStreamHook(path, hookSystem);
  const arrayBufferPromise = new Response(readableStream).arrayBuffer();
  return arrayBufferPromise;
}

/**
 * Register a hook and consume the result as a text promise
 * @param path
 * @param hookSystem
 * @returns a text promise
 */
export function useTextPromiseHook(
  path: EncoderHookPath,
  hookSystem: EncoderHookSystem
): Promise<string> {
  const readableStream = useUint8ArrayStreamHook(path, hookSystem);
  const textPromise = new Response(readableStream).text();
  return textPromise;
}
