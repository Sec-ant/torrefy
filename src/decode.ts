import { tokenizer } from "./generators/async/tokenizer.js";
import { parse } from "./parse.js";

/**
 * Decode, a wrapper function of tokenizer async generator and parse
 * @param data
 * @returns
 */
export async function decode(data: AsyncIterable<Uint8Array>) {
  return await parse(tokenizer(data));
}
