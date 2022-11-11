import { nextPowerOfTwo, merkleRoot } from "../utils/misc.js";

/**
 * Merkle tree balancer transformer class
 */
class MerkleTreeBalancerTransformer
  implements Transformer<Uint8Array, Uint8Array[]>
{
  leafCount = 0;
  merkleLeaves: Uint8Array[] = [];
  blocksPerPiece;
  constructor(blocksPerPiece: number) {
    this.blocksPerPiece = blocksPerPiece;
  }
  transform(chunk: Uint8Array) {
    ++this.leafCount;
    this.merkleLeaves.push(chunk);
  }
  async flush(controller: TransformStreamDefaultController<Uint8Array[]>) {
    const restLeafCount = nextPowerOfTwo(this.leafCount) - this.leafCount;
    if (restLeafCount > 0) {
      const padLeaf = await this.padLeafPromise;
      for (let i = 0; i < restLeafCount; ++i) {
        this.merkleLeaves.push(padLeaf);
      }
    }
    controller.enqueue(this.merkleLeaves);
  }
  get padLeafPromise() {
    return merkleRoot(
      Array<Uint8Array>(this.blocksPerPiece).fill(new Uint8Array(32))
    );
  }
}

export class MerkleTreeBalancer extends TransformStream<
  Uint8Array,
  Uint8Array[]
> {
  constructor(blocksPerPiece: number) {
    const transformer = new MerkleTreeBalancerTransformer(blocksPerPiece);
    super(transformer);
  }
}
