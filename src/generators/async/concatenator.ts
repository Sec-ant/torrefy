export async function* concatenator<T = unknown>(
  asyncIterables: Iterable<AsyncIterable<T>> | AsyncIterable<AsyncIterable<T>>
) {
  for await (const asyncIterable of asyncIterables) {
    for await (const chunk of asyncIterable) {
      yield chunk;
    }
  }
}
