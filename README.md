# base-whatever
An npm package for encoding and decoding integers in arbitrary numeral systems. A numeral system is given as a string of unique UTF-8 characters, which are considered digits in arising order. For example, the decimal system can be specified as `"0123456789"`, and the upper-case hexadecimal as `"0123456789ABCDEF"`. Some basic numeral systems are included in the package through the exported `systems` object. 

The base used for conversions between strings and numbers is taken as the length of the string of digits. Any base &ge; 1 is supported. The first character of the string of digits is considered to be the zero symbol, unless the base is 1 in which case there is no zero symbol but zero is represented as the empty string. This package only operates on integers within the range of integers safely representable by the JS `number` type, i.e. [`Number.MIN_SAFE_INTEGER`, `Number.MAX_SAFE_INTEGER`]. 

Since all UTF-8 characters are supported, any symbol can be used to represent any digit. For example, one can encode and decode numbers in binary using the thumbs up/down emojis, using the numeral system `"👎👍"`.

One thing this package can be used for is generating all possible strings from a given alphabet, starting from the shortest ones and ensuring all strings generated are unique. This can be achieved by selecting a suitable numeral system and repeatedly encoding increasing integers starting from 0. This could be useful for generating short, human-readable identifiters with arbitrary UTF-8 alphabets. Specifically, the `encode` method of the `Converter` class can do this.

A mathematical explanation of the previous paragraph is that the package provides an injective (bijective if no signs or leading zeroes are used in strings) function from the non-negative integers to the strings over an arbitrary alphabet such that the lengths of the strings scale logarithmically with the numbers encoded (unless a unary system is used, in which case the lengths of the strings scale linearly with the size of the numbers encoded).

## Installing locally
`npm i base-whatever` or `yarn add base-whatever`

## Installing globally
`npm i -g base-whatever` or `yarn global add base-whatever`

## Usage example
```typescript
import { Converter, systems, encode, decode } from "base-whatever";

// Positive and negative numbers
let converter = new Converter(systems.OCTAL);
console.log(converter.encode(-85)); // "-125"
console.log(converter.encode(85)); // "125"
console.log(converter.decode("125")); // 85
console.log(converter.decode("+125")); // 85
console.log(converter.decode("-125")); // -85

// Zero treatment
converter = new Converter(systems.HEXA_UPPER);
console.log(converter.encode(309)); // "135"
console.log(converter.encode(0)); // "0"
console.log(converter.encode(-0)); // "0"
console.log(converter.decode("0")); // 0
console.log(converter.decode("-0")); // 0
console.log(converter.decode("+0")); // 0
console.log(converter.decode("135")); // 309
console.log(converter.decode("00000135")); // 309
console.log(converter.decode("-00000135")); // -309

// Custom digits
converter = new Converter("012"); // base 3
console.log(converter.encode(12)); // "110"
console.log(converter.decode("110")); // 12

// Unary base
converter = new Converter(systems.UNARY_VERTICAL_BAR);
console.log(converter.encode(16)); // "||||||||||||||||"
console.log(converter.decode("||||||||||||||||")); // 16
console.log(converter.decode("")); // 0

// Using util functions
console.log(encode(systems.BINARY, 32)) // "100000"
console.log(decode(systems.BINARY, "100000")) // 32
```

## API Reference
See the JSDoc comments for a complete API reference.
