import { UpdateProgress } from "../create.js";
import { merkleRoot } from "../utils/misc.js";

export interface MerkleRootCalculatorOptions {
  updateProgress?: UpdateProgress;
}

export async function* merkleRootCalculator(
  asyncIterable: AsyncIterable<Uint8Array[]>,
  { updateProgress }: MerkleRootCalculatorOptions = {}
) {
  for await (const chunks of asyncIterable) {
    yield await merkleRoot(chunks);
    // todo: should I await?
    updateProgress && (await updateProgress());
  }
}
