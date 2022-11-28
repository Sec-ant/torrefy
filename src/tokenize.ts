import { tokenizer } from "./generators/async/tokenizer.js";

/**
 * Tokenize, a wrapper function of tokenizer async generator
 * @param data
 * @returns an iterable that produces tokens
 */
export function tokenize(data: AsyncIterable<Uint8Array>) {
  return tokenizer(data);
}
