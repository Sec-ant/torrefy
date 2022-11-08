import { BData, BList, BDictionary, BUFF_D, BUFF_E, BUFF_L } from "./encode.js";
import { isDigit, concatUint8Arrays } from "./utils.js";

enum TokenType {
  Integer = "Integer",
  ByteString = "ByteString",
  ListStart = "ListStart",
  ListEnd = "ListEnd",
  DictionaryStart = "DictionaryStart",
  DictionaryEnd = "DictionaryEnd",
}

interface IntegerToken {
  type: TokenType.Integer;
  value: Uint8Array;
}

interface ByteStringToken {
  type: TokenType.ByteString;
  value: Uint8Array;
}

interface ListStartToken {
  type: TokenType.ListStart;
}

interface ListEndToken {
  type: TokenType.ListEnd;
}

interface DictionaryStartToken {
  type: TokenType.DictionaryStart;
}

interface DictionaryEndToken {
  type: TokenType.DictionaryEnd;
}

export type Token<T extends TokenType = TokenType> = T extends TokenType.Integer
  ? IntegerToken
  : T extends TokenType.ByteString
  ? ByteStringToken
  : T extends TokenType.ListStart
  ? ListStartToken
  : T extends TokenType.ListEnd
  ? ListEndToken
  : T extends TokenType.DictionaryStart
  ? DictionaryStartToken
  : T extends TokenType.DictionaryEnd
  ? DictionaryEndToken
  :
      | IntegerToken
      | ByteStringToken
      | ListStartToken
      | ListEndToken
      | DictionaryStartToken
      | DictionaryEndToken;

const BYTE_L = BUFF_L[0];

const BYTE_D = BUFF_D[0];

const BYTE_E = BUFF_E[0];

const BYTE_I = 105;

const BYTE_COLON = 58;

const BYTE_MINUS = 45;

export const BYTE_0 = 48;

class TokenizerTransformer implements Transformer<Uint8Array, Token> {
  endStack: (TokenType.DictionaryEnd | TokenType.ListEnd)[] = [];
  token: Token | null = null;
  byteStringLength: number = 0;
  byteStringOffset: number = 0;
  transform(
    chunk: Uint8Array,
    controller: TransformStreamDefaultController<Token>
  ) {
    this.tokenize(chunk, controller);
  }
  flush() {
    if (
      this.endStack.length ||
      this.token ||
      this.byteStringLength ||
      this.byteStringOffset
    ) {
      throw new SyntaxError("Unexpected end of torrent stream");
    }
  }
  tokenize(
    chunk: Uint8Array,
    controller: TransformStreamDefaultController<Token>
  ) {
    // empty chunk
    if (chunk.byteLength === 0) {
      return;
    }
    // check token type
    if (this.token === null && this.byteStringLength === 0) {
      const firstByte = chunk[0];
      // integer
      if (firstByte === BYTE_I) {
        this.token = {
          type: TokenType.Integer,
          value: new Uint8Array(),
        };
      }
      // byte string length
      else if (isDigit(firstByte)) {
        // digit to number
        this.byteStringLength = firstByte - BYTE_0;
      }
      // list start
      else if (firstByte === BYTE_L) {
        // push list end byte to stack
        this.endStack.push(TokenType.ListEnd);
        // enqueue list start token
        controller.enqueue({
          type: TokenType.ListStart,
        });
      }
      // dictionary start
      else if (firstByte === BYTE_D) {
        // push dictionary end byte to stack
        this.endStack.push(TokenType.DictionaryEnd);
        // enqueue dictionary start token
        controller.enqueue({
          type: TokenType.DictionaryStart,
        });
      }
      // list or dictionary end
      else if (firstByte === BYTE_E) {
        // pop end byte from stack
        const tokenType = this.endStack.pop();
        // nothing is popped: unbalanced start and end byte
        if (!tokenType) {
          throw new SyntaxError("Unbalanced delimiter");
        }
        // enqueue list or dictionary end token
        controller.enqueue({
          type: tokenType,
        });
      }
      // unexpected first byte
      else {
        throw new SyntaxError(`Unexpected byte: ${firstByte}`);
      }
      // tokenize following bytes
      this.tokenize(chunk.subarray(1), controller);
    }
    // process token
    else if (this.token && this.byteStringLength === 0) {
      // integer
      if (this.token.type === TokenType.Integer) {
        const indexOfE = chunk.indexOf(BYTE_E);
        // integer end not found
        if (indexOfE === -1) {
          // gather all bytes into token value
          this.token.value = this.token.value
            ? concatUint8Arrays(this.token.value, chunk)
            : chunk;
        }
        // integer end found
        else {
          // gather bytes before end into token value
          this.token.value = this.token.value
            ? concatUint8Arrays(this.token.value, chunk.subarray(0, indexOfE))
            : chunk.subarray(0, indexOfE);
          // equeue integer token (token is copied)
          controller.enqueue(this.token);
          // reset token to null
          this.token = null;
          // tokenize following bytes
          this.tokenize(chunk.subarray(indexOfE + 1), controller);
        }
      }
      // byte string
      else if (this.token.type === TokenType.ByteString) {
        // total byte string length
        const byteStringLength = this.token.value.byteLength;
        // remaining byte string length
        const remainingByteStringLength =
          byteStringLength - this.byteStringOffset;
        // chunk length
        const chunkLength = chunk.byteLength;
        // chunk length smaller than remaining byte string length
        if (chunkLength < remainingByteStringLength) {
          // gather all bytes from the chunk
          this.token.value.set(chunk, this.byteStringOffset);
          // update offset
          this.byteStringOffset += chunkLength;
        }
        // chunk length equal to or greater than remaining byte string length
        else {
          // gather bytes before end into token value
          this.token.value.set(
            chunk.subarray(0, remainingByteStringLength),
            this.byteStringOffset
          );
          // reset byte string offset
          this.byteStringOffset = 0;
          // equeue byte string token (token is copied)
          controller.enqueue(this.token);
          // reset token to null
          this.token = null;
          // tokenize following bytes
          this.tokenize(chunk.subarray(remainingByteStringLength), controller);
        }
      }
      // program shouldn't reach here
      else {
        throw new Error("This is a bug");
      }
    }
    // process byte length
    else if (this.byteStringLength && this.token === null) {
      let indexOfColon = -1;
      for (const [index, byte] of chunk.entries()) {
        // byte string length digit
        if (isDigit(byte)) {
          // let's assume the byte string length is smaller than the max_safe_integer
          // or the torrent file would be huuuuuuuuuuuuuge!
          this.byteStringLength = 10 * this.byteStringLength - BYTE_0 + byte;
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
        this.token = {
          type: TokenType.ByteString,
          value: new Uint8Array(this.byteStringLength),
        };
        // reset byte string length
        this.byteStringLength = 0;
        // tokenize following bytes
        this.tokenize(chunk.subarray(indexOfColon + 1), controller);
      }
    }
    // program shouldn't reach here
    else {
      throw new Error("This is a bug");
    }
  }
}

export function makeTokenizer() {
  return new TransformStream(new TokenizerTransformer());
}

export async function parse(tokenReadableStream: ReadableStream<Token>) {
  let parsedResult: BData | undefined;
  const contextStack: (BDictionary | BList)[] = [];
  const tokenStreamReader = tokenReadableStream.getReader();
  let dictionaryKey: string | undefined;
  while (true) {
    const { done, value: token } = await tokenStreamReader.read();
    if (done) {
      break;
    }
    const currentContext = contextStack.at(-1);
    // current context: global
    if (!currentContext) {
      if (typeof parsedResult !== "undefined") {
        throw new SyntaxError(`Unexpected token: ${token}`);
      }
      switch (token.type) {
        case TokenType.Integer:
          parsedResult = parseInteger(token.value);
          break;
        case TokenType.ByteString:
          parsedResult = parseByteString(token.value);
          break;
        case TokenType.DictionaryStart: {
          const nextContext: BDictionary = Object.create(null);
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
          throw new SyntaxError(`Unexpected token: ${token}`);
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
          const nextContext: BDictionary = Object.create(null);
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
          throw new SyntaxError(`Unexpected token: ${token}`);
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
            throw new SyntaxError(`Unexpected token: ${token}`);
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
            const nextContext: BDictionary = Object.create(null);
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
            throw new SyntaxError(`Unexpected token: ${token}`);
        }
        dictionaryKey = undefined;
      }
    }
  }
  if (contextStack.length || typeof parsedResult === "undefined") {
    throw new Error(`Unexpected end of token stream`);
  }
  return parsedResult;
}

export async function decode(
  torrentReadableStream: ReadableStream<Uint8Array>
): Promise<BData> {
  const tokenizer = makeTokenizer();
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
    if (!isDigit(byte)) {
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
