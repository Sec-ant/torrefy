import { encoder, EncoderOptions } from "./generators/async/encoder.js";
import { BData } from "./utils/codec.js";

/**
 * BEncode, a wrapper function of encoder async generator
 * @param data
 * @param options
 * @returns an iterable that produces uint8 array
 */
export function encode(data: BData<false>, options?: EncoderOptions) {
  return encoder(data, options);
}
