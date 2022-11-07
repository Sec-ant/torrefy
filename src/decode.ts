import { BUFF_D, BUFF_E, BUFF_L } from "./encode.js";

enum TokenType {
  Integer,

  ByteString,

  ListStart,
  ListEnd,

  DictionaryStart,
  DictionaryEnd,
}

interface IntegerToken {
  type: TokenType.Integer;
  value?: Uint8Array;
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

type Token<T extends TokenType = TokenType> = T extends TokenType.Integer
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

const BYTE_I = 105;

const BYTE_L = BUFF_L[0];

const BYTE_D = BUFF_D[0];

const BYTE_E = BUFF_E[0];

const BYTE_COLON = 58;

const BYTE_0 = 48;

const BYTE_9 = 57;

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
      throw new SyntaxError("Incomplete stream");
    }
  }
  tokenize(
    chunk: Uint8Array,
    controller: TransformStreamDefaultController<Token>
  ) {
    // empty chunk
    if (chunk.length === 0) {
      return;
    }
    // check token type
    if (this.token === null && this.byteStringLength === 0) {
      const firstByte = chunk[0];
      // integer
      if (firstByte === BYTE_I) {
        this.token = {
          type: TokenType.Integer,
        };
      }
      // bytestring length
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
          // equeue integer token
          // TODO: should I clone token ?
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
          // equeue byte string token
          // TODO: should I clone token ?
          controller.enqueue(this.token);
          // reset token to null
          this.token = null;
          // tokenize following bytes
          this.tokenize(chunk.subarray(remainingByteStringLength), controller);
        }
      }
      // program shouldn't reach here
      else {
        new Error("This is a bug");
      }
    }
    // process byte length
    else if (this.byteStringLength && this.token === null) {
      let indexOfColon = -1;
      for (const [index, byte] of chunk.entries()) {
        // byte string length digit
        if (isDigit(byte)) {
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
        // initialize a byte string token with fixed length uint8 array
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
      new Error("This is a bug");
    }
  }
}

export function makeTokenizer() {
  return new TransformStream(new TokenizerTransformer());
}

function isDigit(byte: number) {
  if (byte >= BYTE_0 && byte <= BYTE_9) {
    return true;
  }
  return false;
}

function concatUint8Arrays(...uint8Arrays: Uint8Array[]) {
  const result = new Uint8Array(
    uint8Arrays.reduce(
      (length, uint8Array) => length + uint8Array.byteLength,
      0
    )
  );
  uint8Arrays.reduce((offset, uint8Array) => {
    result.set(uint8Array, offset);
    return offset + uint8Array.byteLength;
  }, 0);
  return result;
}

export {};
