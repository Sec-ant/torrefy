export interface ChunkRegulatorOptions {
  outputLength: number;
  padding: boolean;
}

export async function* chunkRegulator(
  asyncIterable: AsyncIterable<Uint8Array>,
  { outputLength, padding = false }: ChunkRegulatorOptions
) {
  let outputPointer = 0;
  const output = new Uint8Array(outputLength);
  for await (let chunk of asyncIterable) {
    while (outputPointer + chunk.byteLength >= outputLength) {
      const chunkEnd = outputLength - outputPointer;
      output.set(chunk.subarray(0, chunkEnd), outputPointer);
      yield output;
      outputPointer = 0;
      chunk = chunk.subarray(chunkEnd);
    }
    output.set(chunk, outputPointer);
    outputPointer += chunk.byteLength;
  }
  if (outputPointer === 0) {
    return;
  }
  if (padding) {
    output.set(new Uint8Array(outputLength - outputPointer), outputPointer);
    yield output;
  } else {
    yield output.subarray(0, outputPointer);
  }
}
