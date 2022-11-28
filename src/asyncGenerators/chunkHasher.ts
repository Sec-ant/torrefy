import { UpdateProgress } from "../create.js";
import type JsSHA1 from "jssha/sha1";
import type JsSHA256 from "jssha/sha256";

type JsSHA = JsSHA1 | JsSHA256;

export type HashAlgorithm = "SHA-1" | "SHA-256";

export interface ChunkHasherOptions {
  hashAlgorithm?: HashAlgorithm;
  updateProgress?: UpdateProgress;
}

export async function* chunkHasher(
  asyncIterable: AsyncIterable<Uint8Array>,
  { hashAlgorithm = "SHA-1", updateProgress }: ChunkHasherOptions = {
    hashAlgorithm: "SHA-1",
  }
) {
  for await (const chunk of asyncIterable) {
    if ("subtle" in crypto) {
      yield new Uint8Array(await crypto.subtle.digest(hashAlgorithm, chunk));
    } else {
      let jsSHA: JsSHA;
      switch (hashAlgorithm) {
        case "SHA-1":
          jsSHA = new (await import("jssha/sha1")).default(
            hashAlgorithm,
            "UINT8ARRAY"
          );
          break;
        case "SHA-256":
          jsSHA = new (await import("jssha/sha256")).default(
            hashAlgorithm,
            "UINT8ARRAY"
          );
          break;
        default:
          throw hashAlgorithm satisfies never;
      }
      jsSHA.update(chunk);
      yield jsSHA.getHash("UINT8ARRAY");
    }
    // todo: should I await?
    updateProgress && (await updateProgress());
  }
}
