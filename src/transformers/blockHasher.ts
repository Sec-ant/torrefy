import { nextPowerOfTwo } from "../utils/misc.js";

/**
 * 32-byte-zeros
 */
const ZEROS_32_BYTES = new Uint8Array(32);

/**
 * Block hasher transformer class
 */
class BlockHasherTransformer implements Transformer<Uint8Array, Uint8Array[]> {
  blockCount = 0;
  merkleLeaves: Uint8Array[] = [];
  blocksPerPiece;
  constructor(blocksPerPiece: number) {
    this.blocksPerPiece = blocksPerPiece;
  }
  async transform(
    chunk: Uint8Array,
    controller: TransformStreamDefaultController<Uint8Array[]>
  ) {
    ++this.blockCount;
    let blockHash: Uint8Array;
    try {
      blockHash = new Uint8Array(await crypto.subtle.digest("SHA-256", chunk));
    } catch {
      const { default: jsSHA256 } = await import("jssha/sha256");
      const sha256Obj = new jsSHA256("SHA-256", "UINT8ARRAY");
      sha256Obj.update(chunk);
      blockHash = sha256Obj.getHash("UINT8ARRAY");
    }
    this.merkleLeaves.push(blockHash);
    if (this.merkleLeaves.length === this.blocksPerPiece) {
      controller.enqueue(this.merkleLeaves);
      this.merkleLeaves = [];
    }
  }
  flush(controller: TransformStreamDefaultController<Uint8Array[]>) {
    if (this.blockCount === 0) {
      return;
    }
    // http://bittorrent.org/beps/bep_0052.html#:~:text=The%20remaining%20leaf%20hashes%20beyond%20the%20end%20of%20the%20file%20required%20to%20construct%20upper%20layers%20of%20the%20merkle%20tree%20are%20set%20to%20zero
    let restBlockCount = 0;
    // If the file is smaller than one piece then the block hashes
    // should be padded to the next power of two instead of the next
    // piece boundary.
    if (this.blockCount < this.blocksPerPiece) {
      restBlockCount = nextPowerOfTwo(this.blockCount) - this.blockCount;
    } else {
      const residue = this.blockCount % this.blocksPerPiece;
      if (residue > 0) {
        restBlockCount = this.blocksPerPiece - residue;
      }
    }
    if (restBlockCount > 0) {
      for (let i = 0; i < restBlockCount; ++i) {
        this.merkleLeaves.push(ZEROS_32_BYTES);
      }
    }
    if (this.merkleLeaves.length > 0) {
      controller.enqueue(this.merkleLeaves);
    }
  }
}

export class BlockHasher extends TransformStream<Uint8Array, Uint8Array[]> {
  constructor(blocksPerPiece: number) {
    const transformer = new BlockHasherTransformer(blocksPerPiece);
    super(transformer);
  }
}
