import Converter from "./converter";

/**
 * Equivalent to new Converter(digits).encode(n).
 */
const encode = (digits: string, n: number): string => new Converter(digits).encode(n);

/**
 * Equivalent to new Converter(digits).decode(s).
 */
const decode = (digits: string, s: string): number => new Converter(digits).decode(s);

export {
  encode, 
  decode,
};