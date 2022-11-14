import {
  BData,
  BList,
  BObject,
  BYTE_0,
  BYTE_MINUS,
  isDigitByte,
} from "./utils/codec.js";
import { Token, TokenType, Tokenizer } from "./transformers/tokenizer.js";

export async function parse(
  tokenReadableStream: ReadableStream<Token>
): Promise<BData | undefined> {
  let parsedResult: BData | undefined;
  const contextStack: (BObject | BList)[] = [];
  const tokenStreamReader = tokenReadableStream.getReader();
  let dictionaryKey: string | undefined;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value: token } = await tokenStreamReader.read();
    if (done) {
      break;
    }
    const currentContext = contextStack.at(-1);
    // current context: global
    if (!currentContext) {
      if (typeof parsedResult !== "undefined") {
        throw new SyntaxError(`Unexpected token: ${JSON.stringify(token)}`);
      }
      switch (token.type) {
        case TokenType.Integer:
          parsedResult = parseInteger(token.value);
          break;
        case TokenType.ByteString:
          parsedResult = parseByteString(token.value);
          break;
        case TokenType.DictionaryStart: {
          const nextContext = Object.create(null) as BObject;
          contextStack.push(nextContext);
          parsedResult = nextContext;
          break;
        }
        case TokenType.ListStart: {
          const nextContext: BList = [];
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
        case TokenType.Integer:
          currentContext.push(parseInteger(token.value));
          break;
        case TokenType.ByteString:
          currentContext.push(parseByteString(token.value));
          break;
        case TokenType.DictionaryStart: {
          const nextContext = Object.create(null) as BObject;
          currentContext.push(nextContext);
          contextStack.push(nextContext);
          break;
        }
        case TokenType.ListStart: {
          const nextContext: BList = [];
          currentContext.push(nextContext);
          contextStack.push(nextContext);
          break;
        }
        case TokenType.ListEnd:
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
          case TokenType.ByteString:
            dictionaryKey = parseByteString(token.value);
            break;
          case TokenType.DictionaryEnd:
            contextStack.pop();
            break;
          default:
            throw new SyntaxError(`Unexpected token: ${JSON.stringify(token)}`);
        }
      }
      // dictionary value
      else {
        switch (token.type) {
          case TokenType.Integer:
            currentContext[dictionaryKey] = parseInteger(token.value);
            break;
          case TokenType.ByteString:
            currentContext[dictionaryKey] = parseByteString(token.value);
            break;
          case TokenType.DictionaryStart: {
            const nextContext = Object.create(null) as BObject;
            currentContext[dictionaryKey] = nextContext;
            contextStack.push(nextContext);
            break;
          }
          case TokenType.ListStart: {
            const nextContext: BList = [];
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
    throw new Error(`Unexpected end of token stream`);
  }
  return parsedResult;
}

export async function decode(
  torrentReadableStream: ReadableStream<Uint8Array>
): Promise<BData | undefined> {
  const tokenizer = new Tokenizer();
  const tokenReadableStream = torrentReadableStream.pipeThrough(tokenizer);
  return await parse(tokenReadableStream);
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
  const textDecoder = new TextDecoder();
  return textDecoder.decode(tokenValue);
}
