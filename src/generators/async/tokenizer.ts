import {
  BYTE_0,
  BYTE_COLON,
  BYTE_D,
  BYTE_E,
  BYTE_I,
  BYTE_L,
  isDigitByte,
} from "../../utils/codec.js";
import { concatUint8Arrays } from "../../utils/misc.js";

export type TokenType =
  | "Integer"
  | "ByteString"
  | "ListStart"
  | "ListEnd"
  | "DictionaryStart"
  | "DictionaryEnd";

export interface TokenBase {
  type: TokenType;
  value?: Uint8Array;
}

export interface IntegerToken extends TokenBase {
  type: "Integer";
  value: Uint8Array;
}

export interface ByteStringToken extends TokenBase {
  type: "ByteString";
  value: Uint8Array;
}

export interface ListStartToken extends TokenBase {
  type: "ListStart";
}

export interface ListEndToken extends TokenBase {
  type: "ListEnd";
}

export interface DictionaryStartToken extends TokenBase {
  type: "DictionaryStart";
}

export interface DictionaryEndToken extends TokenBase {
  type: "DictionaryEnd";
}

export type Token<T extends TokenType = TokenType> = T extends "Integer"
  ? IntegerToken
  : T extends "ByteString"
  ? ByteStringToken
  : T extends "ListStart"
  ? ListStartToken
  : T extends "ListEnd"
  ? ListEndToken
  : T extends "DictionaryStart"
  ? DictionaryStartToken
  : T extends "DictionaryEnd"
  ? DictionaryEndToken
  : never;

export async function* tokenizer(
  asyncIterable: AsyncIterable<Uint8Array>
): AsyncGenerator<Token, void, unknown> {
  const endStack: ("DictionaryEnd" | "ListEnd")[] = [];
  let token: Token | null = null;
  let byteStringLength = -1;
  let byteStringOffset = 0;
  for await (let chunk of asyncIterable) {
    while (chunk.byteLength) {
      // check token type
      if (token === null && byteStringLength === -1) {
        const firstByte = chunk[0] as number;
        // integer
        if (firstByte === BYTE_I) {
          token = {
            type: "Integer",
            value: new Uint8Array(),
          };
        }
        // byte string length
        else if (isDigitByte(firstByte)) {
          // digit to number
          byteStringLength = firstByte - BYTE_0;
        }
        // list start
        else if (firstByte === BYTE_L) {
          // push list end byte to stack
          endStack.push("ListEnd");
          // enqueue list start token
          yield {
            type: "ListStart",
          };
        }
        // dictionary start
        else if (firstByte === BYTE_D) {
          // push dictionary end byte to stack
          endStack.push("DictionaryEnd");
          // enqueue dictionary start token
          yield {
            type: "DictionaryStart",
          };
        }
        // list or dictionary end
        else if (firstByte === BYTE_E) {
          // pop end byte from stack
          const tokenType = endStack.pop();
          // nothing is popped: unbalanced start and end byte
          if (!tokenType) {
            throw new SyntaxError("Unbalanced delimiter");
          }
          // enqueue list or dictionary end token
          yield {
            type: tokenType,
          };
        }
        // unexpected first byte
        else {
          throw new SyntaxError(`Unexpected byte: ${firstByte}`);
        }
        // tokenize following bytes
        chunk = chunk.subarray(1);
        continue;
      }
      // process token
      else if (token && byteStringLength === -1) {
        // integer
        if (token.type === "Integer") {
          const indexOfE = chunk.indexOf(BYTE_E);
          // integer end not found
          if (indexOfE === -1) {
            // gather all bytes into token value
            token.value = token.value
              ? concatUint8Arrays(token.value, chunk)
              : chunk;
          }
          // integer end found
          else {
            // gather bytes before end into token value
            token.value = token.value
              ? concatUint8Arrays(token.value, chunk.subarray(0, indexOfE))
              : chunk.subarray(0, indexOfE);
            // equeue integer token (token is copied)
            yield token;
            // reset token to null
            token = null;
            // tokenize following bytes
            chunk = chunk.subarray(indexOfE + 1);
            continue;
          }
        }
        // byte string
        else if (token.type === "ByteString") {
          // total byte string length
          const byteStringLength = token.value.byteLength;
          // remaining byte string length
          const remainingByteStringLength = byteStringLength - byteStringOffset;
          // chunk length
          const chunkLength = chunk.byteLength;
          // chunk length smaller than remaining byte string length
          if (chunkLength < remainingByteStringLength) {
            // gather all bytes from the chunk
            token.value.set(chunk, byteStringOffset);
            // update offset
            byteStringOffset += chunkLength;
          }
          // chunk length equal to or greater than remaining byte string length
          else {
            // gather bytes before end into token value
            token.value.set(
              chunk.subarray(0, remainingByteStringLength),
              byteStringOffset
            );
            // reset byte string offset
            byteStringOffset = 0;
            // equeue byte string token (token is copied)
            yield token;
            // reset token to null
            token = null;
            // tokenize following bytes
            chunk = chunk.subarray(remainingByteStringLength);
            continue;
          }
        }
        // program shouldn't reach here
        else {
          const exhaustiveCheck: never = token;
          throw new Error(
            `Unhandled token: ${JSON.stringify(exhaustiveCheck)}`
          );
        }
      }
      // process byte length
      else if (byteStringLength > -1 && token === null) {
        let indexOfColon = -1;
        for (const [index, byte] of chunk.entries()) {
          // byte string length digit
          if (isDigitByte(byte)) {
            // let's assume the byte string length is smaller than the max_safe_integer
            // or the torrent file would be huuuuuuuuuuuuuge!
            byteStringLength = 10 * byteStringLength - BYTE_0 + byte;
          }
          // byte string length end
          else if (byte === BYTE_COLON) {
            indexOfColon = index;
            break;
          }
          // unexpected byte
          else {
            throw new SyntaxError(`Unexpected byte: ${byte}`);
          }
        }
        // colon is found
        if (indexOfColon !== -1) {
          // initialize a byte string token with a fixed length uint8 array
          token = {
            type: "ByteString",
            value: new Uint8Array(byteStringLength),
          };
          // reset byte string length
          byteStringLength = -1;
          // tokenize following bytes
          chunk = chunk.subarray(indexOfColon + 1);
          continue;
        }
      }
      // program shouldn't reach here
      else {
        throw new Error("Unexpected state transition");
      }
    }
  }
}
