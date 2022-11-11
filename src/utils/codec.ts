// bencode integer type
type BIntegerStrict = number | bigint;
type BIntegerLoose = BIntegerStrict | boolean;
export type BInteger<Strict extends boolean = true> = Strict extends true
  ? BIntegerStrict
  : BIntegerLoose;

// bencode byte string type
type BByteStringStrict = string;
type BByteStringLoose = BByteStringStrict | ArrayBuffer;
export type BByteString<Strict extends boolean = true> = Strict extends true
  ? BByteStringStrict
  : BByteStringLoose;

// bencode list type
type BListStrict = BData<true>[];
type BListLoose = BData<false>[];
export type BList<Strict extends boolean = true> = Strict extends true
  ? BListStrict
  : BListLoose;

// bencode dictionary type
interface BObjectStrict {
  [key: BByteString<true>]: BData<true>;
}
interface BObjectLoose {
  [key: BByteString<true>]: BData<false>;
}
export type BObject<Strict extends boolean = true> = Strict extends true
  ? BObjectStrict
  : BObjectLoose;
export type BMap = Map<BByteString<false>, BData<false>>;

type BDictionaryStrict = BObject<true>;
type BDictionaryLoose = BObject<false> | BMap;
export type BDictionary<Strict extends boolean = true> = Strict extends true
  ? BDictionaryStrict
  : BDictionaryLoose;

// bencode data type
type BDataStrict =
  | BInteger<true>
  | BByteString<true>
  | BList<true>
  | BDictionary<true>;
type BDataLoose =
  | BInteger<false>
  | BByteString<false>
  | BList<false>
  | BDictionary<false>
  | undefined
  | null;
export type BData<Strict extends boolean = true> = Strict extends true
  ? BDataStrict
  : BDataLoose;

/**
 * bencode byte: l (stands for list start)
 */
export const BYTE_L = 108;

/**
 * bencode buff: l (stands for list start)
 */
export const BUFF_L = new Uint8Array([BYTE_L]);

/**
 * bencode byte: d (stands for dictionary start)
 */
export const BYTE_D = 100;

/**
 * bencode buff: d (stands for dictionary start)
 */
export const BUFF_D = new Uint8Array([BYTE_D]);

/**
 * bencode byte: e (stands for end)
 */
export const BYTE_E = 101;

/**
 * bencode buff: e (stands for end)
 */
export const BUFF_E = new Uint8Array([BYTE_E]);

/**
 * bencode byte: i (stands for integer start)
 */
export const BYTE_I = 105;

/**
 * bencode buff: i (stands for integer start)
 */
export const BUFF_I = new Uint8Array([BYTE_I]);

/**
 * bencode byte: : (stands for byte string length end)
 */
export const BYTE_COLON = 58;

/**
 * bencode buff: : (stands for byte string length end)
 */
export const BUFF_COLON = new Uint8Array([BYTE_COLON]);

/**
 * bencode byte: - (stands for -)
 */
export const BYTE_MINUS = 45;

/**
 * bencode buff: - (stands for -)
 */
export const BUFF_MINUS = new Uint8Array([BYTE_MINUS]);

/**
 * bencode byte: 0 (stands for 0)
 */
export const BYTE_0 = 48;

/**
 * bencode buff: 0 (stands for 0)
 */
export const BUFF_0 = new Uint8Array([BYTE_0]);

/**
 * is byte digit
 * @param byte
 * @returns
 */
export function isDigitByte(byte: number) {
  if (byte >= BYTE_0 && byte <= BYTE_0 + 9) {
    return true;
  }
  return false;
}
