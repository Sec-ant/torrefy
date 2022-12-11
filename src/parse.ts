import {
  BData,
  BList,
  BObject,
  BYTE_0,
  BYTE_MINUS,
  isDigitByte,
} from "./utils/codec.js";
import { Token } from "./generators/async/tokenizer.js";
import { textCodecs } from "./noexports/textCodecs.js";

export async function parse(
  tokenAsyncIterable: AsyncIterable<Token>
): Promise<BData | undefined> {
  let parsedResult: BData | undefined;
  const contextStack: (BObject | (BList & unknown[]))[] = [];
  let dictionaryKey: string | undefined;
  for await (const token of tokenAsyncIterable) {
    const currentContext = contextStack.at(-1);
    // current context: global
    if (!currentContext) {
      if (typeof parsedResult !== "undefined") {
        throw new SyntaxError(`Unexpected token: ${JSON.stringify(token)}`);
      }
      switch (token.type) {
        case "Integer":
          parsedResult = parseInteger(token.value);
          break;
        case "ByteString":
          parsedResult = parseByteString(token.value);
          break;
        case "DictionaryStart": {
          const nextContext = Object.create(null) as BObject;
          contextStack.push(nextContext);
          parsedResult = nextContext;
          break;
        }
        case "ListStart": {
          const nextContext: BList & unknown[] = [];
          contextStack.push(nextContext);
          parsedResult = nextContext;
          break;
        }
        default:
          throw new SyntaxError(`Unexpected token: ${JSON.stringify(token)}`);
      }
    }
    // current context: list
    else if (Array.isArray(currentContext)) {
      switch (token.type) {
        case "Integer":
          currentContext.push(parseInteger(token.value));
          break;
        case "ByteString":
          currentContext.push(parseByteString(token.value));
          break;
        case "DictionaryStart": {
          const nextContext = Object.create(null) as BObject;
          currentContext.push(nextContext);
          contextStack.push(nextContext);
          break;
        }
        case "ListStart": {
          const nextContext: BList & unknown[] = [];
          currentContext.push(nextContext);
          contextStack.push(nextContext);
          break;
        }
        case "ListEnd":
          contextStack.pop();
          break;
        default:
          throw new SyntaxError(`Unexpected token: ${JSON.stringify(token)}`);
      }
    }
    // current context: dictionary
    else {
      // dictionary key
      if (typeof dictionaryKey === "undefined") {
        switch (token.type) {
          case "ByteString":
            dictionaryKey = parseByteString(token.value);
            break;
          case "DictionaryEnd":
            contextStack.pop();
            break;
          default:
            throw new SyntaxError(`Unexpected token: ${JSON.stringify(token)}`);
        }
      }
      // dictionary value
      else {
        switch (token.type) {
          case "Integer":
            currentContext[dictionaryKey] = parseInteger(token.value);
            break;
          case "ByteString":
            currentContext[dictionaryKey] = parseByteString(token.value);
            break;
          case "DictionaryStart": {
            const nextContext = Object.create(null) as BObject;
            currentContext[dictionaryKey] = nextContext;
            contextStack.push(nextContext);
            break;
          }
          case "ListStart": {
            const nextContext: BList & unknown[] = [];
            currentContext[dictionaryKey] = nextContext;
            contextStack.push(nextContext);
            break;
          }
          default:
            throw new SyntaxError(`Unexpected token: ${JSON.stringify(token)}`);
        }
        dictionaryKey = undefined;
      }
    }
  }
  if (contextStack.length) {
    throw new SyntaxError(`Unexpected end of token stream`);
  }
  return parsedResult;
}

function parseInteger(tokenValue: Uint8Array) {
  let integer: number | bigint = 0;
  let isPositive = true;
  for (const [index, byte] of tokenValue.entries()) {
    // branch order is important!
    // handle negative sign
    if (index === 0 && byte === BYTE_MINUS) {
      isPositive = false;
      continue;
    }
    // negative zero is not allowed
    if (index === 1 && !isPositive && byte === BYTE_0) {
      throw new SyntaxError("Negative zero is not a valid integer");
    }
    // leading zeros are not allowed
    if (index === 1 && integer === 0) {
      throw new SyntaxError("Leading zeros are not allowed");
    }
    // not a digit or negative sign
    if (!isDigitByte(byte)) {
      throw new SyntaxError(`Unexpected byte: ${byte}`);
    }
    const byteNumber = byte - BYTE_0;
    // handle immediate overflow
    if (
      isPositive &&
      typeof integer === "number" &&
      integer > (Number.MAX_SAFE_INTEGER - byteNumber) / 10
    ) {
      integer = BigInt(integer);
    }
    // handle immediate underflow
    else if (
      !isPositive &&
      typeof integer === "number" &&
      integer < (Number.MIN_SAFE_INTEGER + byteNumber) / 10
    ) {
      integer = BigInt(integer);
    }
    // handle number
    if (typeof integer === "number") {
      if (isPositive) {
        integer = integer * 10 + byteNumber;
      } else {
        integer = integer * 10 - byteNumber;
      }
    }
    // handle big int
    else {
      if (isPositive) {
        integer = integer * 10n + BigInt(byteNumber);
      } else {
        integer = integer * 10n - BigInt(byteNumber);
      }
    }
  }
  return integer;
}

function parseByteString(tokenValue: Uint8Array) {
  const textDecoder = (textCodecs.decoder ??= new TextDecoder());
  return textDecoder.decode(tokenValue);
}
