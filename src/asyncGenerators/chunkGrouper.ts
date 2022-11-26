import { nextPowerOfTwo, merkleRoot } from "../utils/misc.js";

export interface ChunkGrouperOptions {
  /**
   * blocks per piece
   */
  paddingMultiplier: number;
}

export async function* chunkGrouper(
  asyncIterable: AsyncIterable<Uint8Array>,
  { paddingMultiplier }: ChunkGrouperOptions
) {
  let count = 0;
  const chunks: Uint8Array[] = [];
  for await (const chunk of asyncIterable) {
    ++count;
    chunks.push(chunk);
  }
  const rest = nextPowerOfTwo(count) - count;
  if (rest > 0) {
    const paddingChunk = await merkleRoot(
      Array<Uint8Array>(paddingMultiplier).fill(new Uint8Array(32))
    );
    for (let i = 0; i < rest; ++i) {
      chunks.push(paddingChunk);
    }
  }
  yield chunks;
}
