import {
  BYTE_0,
  BYTE_COLON,
  BYTE_D,
  BYTE_E,
  BYTE_I,
  BYTE_L,
  isDigitByte,
} from "../utils/codec.js";
import { concatUint8Arrays } from "../utils/misc.js";

export enum TokenType {
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
  : never;

class TokenizerTransformer implements Transformer<Uint8Array, Token> {
  endStack: (TokenType.DictionaryEnd | TokenType.ListEnd)[] = [];
  token: Token | null = null;
  byteStringLength = -1;
  byteStringOffset = 0;
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
      this.byteStringLength !== -1 ||
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
    if (this.token === null && this.byteStringLength === -1) {
      const firstByte = chunk[0] as number;
      // integer
      if (firstByte === BYTE_I) {
        this.token = {
          type: TokenType.Integer,
          value: new Uint8Array(),
        };
      }
      // byte string length
      else if (isDigitByte(firstByte)) {
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
    else if (this.token && this.byteStringLength === -1) {
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
    else if (this.byteStringLength > -1 && this.token === null) {
      let indexOfColon = -1;
      for (const [index, byte] of chunk.entries()) {
        // byte string length digit
        if (isDigitByte(byte)) {
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
        this.byteStringLength = -1;
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

export class Tokenizer extends TransformStream<Uint8Array, Token> {
  constructor() {
    const transformer = new TokenizerTransformer();
    super(transformer);
  }
}
