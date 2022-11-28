import { nextPowerOfTwo } from "../../utils/misc.js";

type AssertInteger<N extends number> = number extends N
  ? N
  : `${N}` extends `${bigint}`
  ? N
  : never;

/**
 * 32-byte-zeros
 */
const ZEROS_32_BYTES = new Uint8Array(32);

export interface ChunkPackerOptions<N extends number> {
  /**
   * blocks per piece
   */
  count: AssertInteger<N>;
}

export async function* chunkPacker<N extends number>(
  asyncIterable: AsyncIterable<Uint8Array>,
  { count }: ChunkPackerOptions<N>
) {
  if (count < 0) {
    return;
  }
  let chunks: Uint8Array[] = [];
  if (count === 0) {
    yield chunks;
    return;
  }
  let i = 0;
  for await (const chunk of asyncIterable) {
    ++i;
    chunks.push(chunk);
    if (chunks.length === count) {
      yield chunks;
      chunks = [];
    }
  }
  if (i === 0) {
    return;
  }
  // http://bittorrent.org/beps/bep_0052.html#:~:text=The%20remaining%20leaf%20hashes%20beyond%20the%20end%20of%20the%20file%20required%20to%20construct%20upper%20layers%20of%20the%20merkle%20tree%20are%20set%20to%20zero
  let rest = 0;
  // If the file is smaller than one piece then the block hashes
  // should be padded to the next power of two instead of the next
  // piece boundary.
  if (i < count) {
    rest = nextPowerOfTwo(i) - i;
  } else {
    const remainder = i % count;
    if (remainder > 0) {
      rest = count - remainder;
    }
  }
  for (let i = 0; i < rest; ++i) {
    chunks.push(ZEROS_32_BYTES);
  }
  if (chunks.length > 0) {
    yield chunks;
  }
}
