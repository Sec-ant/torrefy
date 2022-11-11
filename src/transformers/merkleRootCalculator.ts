import { merkleRoot } from "../utils/misc.js";
/**
 * Merkle root calculator transformer class
 */
class MerkleRootCalculatorTransformer
  implements Transformer<Uint8Array[], Uint8Array>
{
  updateProgress;
  constructor(updateProgress?: () => void) {
    this.updateProgress = updateProgress;
  }
  async transform(
    chunk: Uint8Array[],
    controller: TransformStreamDefaultController<Uint8Array>
  ) {
    controller.enqueue(await merkleRoot(chunk));
    if (this.updateProgress) {
      this.updateProgress();
    }
  }
}

export class MerkleRootCalculator extends TransformStream<
  Uint8Array[],
  Uint8Array
> {
  constructor(updateProgress?: () => void) {
    const transformer = new MerkleRootCalculatorTransformer(updateProgress);
    super(transformer);
  }
}
