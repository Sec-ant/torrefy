/**
 * Piece hasher transformer class
 */
class PieceHasherTransformer implements Transformer<Uint8Array, Uint8Array> {
  updateProgress;
  constructor(updateProgress?: () => void) {
    this.updateProgress = updateProgress;
  }
  async transform(
    chunk: Uint8Array,
    controller: TransformStreamDefaultController<Uint8Array>
  ) {
    let pieceHash: Uint8Array;
    try {
      pieceHash = new Uint8Array(await crypto.subtle.digest("SHA-1", chunk));
    } catch {
      const { default: jsSHA1 } = await import("jssha/sha1");
      const sha1Obj = new jsSHA1("SHA-1", "UINT8ARRAY");
      sha1Obj.update(chunk);
      pieceHash = sha1Obj.getHash("UINT8ARRAY");
    }
    controller.enqueue(pieceHash);
    if (this.updateProgress) {
      this.updateProgress();
    }
  }
}

export class PieceHasher extends TransformStream<Uint8Array, Uint8Array> {
  constructor(updateProgress?: () => void) {
    const transformer = new PieceHasherTransformer(updateProgress);
    super(transformer);
  }
}
