/**
 * Chunk splitter transformer class
 */
class ChunkSplitterTransformer implements Transformer<Uint8Array, Uint8Array> {
  residuePointer = 0;
  chunkLength;
  residue;
  opts;
  constructor(chunkLength: number, opts = { padding: false }) {
    this.chunkLength = chunkLength;
    this.opts = opts;
    this.residue = new Uint8Array(this.chunkLength);
  }
  transform(
    chunk: Uint8Array,
    controller: TransformStreamDefaultController<Uint8Array>
  ) {
    while (this.residuePointer + chunk.byteLength >= this.chunkLength) {
      const chunkEnd = this.chunkLength - this.residuePointer;
      this.residue.set(chunk.subarray(0, chunkEnd), this.residuePointer);
      this.residuePointer = 0;
      controller.enqueue(new Uint8Array(this.residue));
      chunk = chunk.subarray(chunkEnd);
    }
    this.residue.set(chunk, this.residuePointer);
    this.residuePointer += chunk.byteLength;
  }
  flush(controller: TransformStreamDefaultController<Uint8Array>) {
    if (this.residuePointer <= 0) {
      return;
    }
    if (this.opts.padding) {
      this.residue.set(
        new Uint8Array(this.chunkLength - this.residuePointer),
        this.residuePointer
      );
      controller.enqueue(this.residue);
    } else {
      controller.enqueue(this.residue.subarray(0, this.residuePointer));
    }
  }
}

export class ChunkSplitter extends TransformStream<Uint8Array, Uint8Array> {
  constructor(chunkLength: number, opts = { padding: false }) {
    const transformer = new ChunkSplitterTransformer(chunkLength, opts);
    super(transformer);
  }
}
