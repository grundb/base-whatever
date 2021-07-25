const isString = (o: any) => typeof(o) === 'string'
const parseUTF8Chars = (s: string) => [...s];
// Asserts that a number is an integer and within the bounds of safe integers. 
// Throws an error if this is not the case.
const checkInteger = (n: number) => {
  if (!(Number.MIN_SAFE_INTEGER <= n && n <= Number.MAX_SAFE_INTEGER && Number.isInteger(n))) {
    throw new Error(`${n} is outside safe integers range`)
  }
}

/**
 * A Converter can be used to encode and decode numbers and strings given 
 * an arbitrary non-empty system of digits.
 */
class Converter {
  // All UTF-8 chars
  private digitArray: readonly string[];
  private valueMap: {[char: string]: number};
  
  /**
   * Constructs a converter object using a set of digits given as a string. The base is taken as the length of the string.
   * If the length of the digits string is greater than 1, the first element is considered to be the zero digit. 
   * @param digits A string representing the set of digits, in ascending order. For example, "01" for ordinary binary or "0123456789" for decimal.
   */
  constructor(digits: string) {
    const digitsArr = parseUTF8Chars(digits)
    if (!digitsArr.every(isString) || digitsArr.length < 1 || new Set(digitsArr).size !== digitsArr.length) {
      throw new Error(`invalid system [${digits}]`)
    }
    this.digitArray = digitsArr;
    this.valueMap = {};
    this.digitArray.forEach((c: string, i: number) => {
      this.valueMap[c] = i;
    });
  }

  /**
   * Returns the base used by this converter.
   */
  get base(): number {
    return this.digitArray.length;
  }

  /**
   * Returns an array of the digits used by this converter.
   */
  get digits() {
    return [...this.digitArray];
  }

  // Assumes the input is a natural (non-negative) number and represented as a valid integer
  private encodeNatural(n: number): string[] {
    const resultingDigits = [];
    if (this.base === 1) {
      for (let i = 0; i < n; i++) {
        resultingDigits.push(0);
      }
    } else {
      while (n >= this.base) {
        const d = n % this.base;
        resultingDigits.push(d);
        n = Math.floor(n / this.base);
      }
      resultingDigits.push(n);
    }
    return resultingDigits.map(d => this.digitArray[d]).reverse();
  }

  // Attempts to decode an array of digits assuming it represents a natural (non-negative) number.
  // If the resulting value is too large, the output may not be an integer.
  private decodeNatural(digits: string[]): number {
    let res: number;
    if (this.base === 1) {
      const theChar = this.digitArray[0]; 
      if (!digits.every(d => d === theChar)) {
        throw new Error(`invalid digit encountered in ${digits}`);
      }
      res = digits.length;
    } else {
      if (digits.length === 0) {
        throw new Error("cannot decode empty string with base > 1")
      }
      res = 0;
      let exp = 0;
      const reversedDigits = digits.reverse();
      for (const c of reversedDigits) {
        const cValue = this.valueMap[c];
        if (typeof(cValue) !== 'number') {
          throw new Error(`invalid digit encountered in ${digits}`);
        }
        res += this.valueMap[c] * Math.pow(this.base, exp);
        exp++; 
      }
    }
    return res;
  }

  /**
   * Encodes a number in the digits used by this Converter. Throws an error if the number
   * is not an integer or not in the range [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER].
   * @param n The number to encode.
   * @returns A string representing the number n in the digits used by this Converter.
   */
  encode(n: number): string {
    checkInteger(n);
    const digits = n >= 0 ? this.encodeNatural(n) : ["-", ...this.encodeNatural(-n)];
    return digits.join('');
  }

  /**
   * Reads a sequence of digits, which must all be present in the string of 
   * digits used by this converter, and parses it as an integer. The string may 
   * start with a sign character, + or -, indicating whether the number is 
   * positive or negative. If the sign character is omitted, the number is assumed to 
   * be positive. Throws if the string represents a number outside the range
   * [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER].
   * 
   * Note that the sign is parsed before the rest of the number, which has important 
   * implications if any of the characters + or - is used as a digit. For example, if
   * the system of digits "-+" is used, the string "+++-+" is parsed as "+(++-+)" = "++-+".
   * 
   * @param s The string to decode.
   * @returns The number which the string represents.
   */
  decode(s: string): number {
    const chars = parseUTF8Chars(s);
    let res: number;
    if (chars.length > 0 && chars[0] === "+") {
      res = this.decodeNatural(chars.slice(1));
    } else if (chars.length > 0 && chars[0] === "-") {
      res = -this.decodeNatural(chars.slice(1));
      // Avoid returning -0, tests pass in either case because 0 === -0
      // but returning -0 seems confusing since we are dealing with integers.
      if (res === 0) { res = 0; }
    } else {
      res = this.decodeNatural(chars)
    }
    checkInteger(res);
    return res;
  }
}

export default Converter;