import { Converter } from "./index";
import assert from 'assert/strict';
import  { 
  UNARY_VERTICAL_BAR,
  BINARY, 
  BINARY_EMOJI,
  OCTAL,
  DECIMAL,
  HEXA_LOWER,
  HEXA_UPPER,
  BASE62,
  BASE64,
} from './systems';
import { decode, encode } from "./util";

const BINARY_SIGNS = "-+"

enum Assertion {
  encoding,
  negEncoding,
  decoding,
  negDecoding,
  posDecoding,
  n2n,
  n2nNeg,
  s2s,
  s2sNeg,
  s2sPos,
}

type ShortTestCase = [string, number, string]
interface TestCase {
  digits: string,
  n: number,
  s: string,
}

const makeTestCase = (tuple: ShortTestCase): TestCase => ({
  digits: tuple[0],
  n: tuple[1],
  s: tuple[2],
})

// Uses === for numbers, Node's (assert/strict).strictEqual, i.e. 
// the SameValue comparison for anything else. Throws when values are not equal.
const assertEqual = (actual: any, expected: any) => {
  if (
      typeof(actual) === "number"
      && typeof(expected) === "number"
      && actual === expected
    ){
    return;
  }
  assert.strictEqual(actual, expected);
}

// Returns a function which runs tests, using a closure to fix certain parameters.
// Only pass positive values to this function, negative values are constructed
// and tested by this function.
const makeRunner = (exclude: Assertion[]) => (stc: ShortTestCase) => {
  const tc = makeTestCase(stc);

  // Arrange
  const converter = new Converter(tc.digits);
  const tcN = tc.n;
  const tcNNeg = -tc.n;
  const tcS = tc.s;
  const tcSNeg = `-${tc.s}`;
  const tcSPos = `+${tc.s}`;


  // Act

  // Encoding
  const sActual = converter.encode(tcN); // e(n)
  const sNegActual = converter.encode(tcNNeg); // e(-n)

  // Decoding
  const nActual = converter.decode(tcS); // d(s)
  const nNegActual = converter.decode(tcSNeg); // d(-s)
  const nPosActual = converter.decode(tcSPos); // d(+s)

  // Encode, then decode
  const n2nActual = converter.decode(sActual); // d(e(n))
  const n2nNegActual = converter.decode(sNegActual); // d(e(-n))

  // Decode, then encode
  const s2sActual = converter.encode(nActual); // e(d(s))
  const s2sNegActual = converter.encode(nNegActual); // e(d(-s))
  const s2sPosActual = converter.encode(nPosActual); // e(d(+s))


  // Assert (one assertion for each "Act" line)

  const argsMap: { [a in Assertion]: [actual: any, expected: any] } = {
    [Assertion.encoding]: [sActual, tcS],
    [Assertion.negEncoding]: [sNegActual, tcSNeg],
    [Assertion.decoding]: [nActual, tcN],
    [Assertion.negDecoding]: [nNegActual, tcNNeg],
    [Assertion.posDecoding]: [nPosActual, tcN],
    [Assertion.n2n]: [n2nActual, tcN],
    [Assertion.n2nNeg]: [n2nNegActual, tcNNeg],
    [Assertion.s2s]: [s2sActual, tcS],
    [Assertion.s2sNeg]: [s2sNegActual, tcSNeg],
    [Assertion.s2sPos]: [s2sPosActual, tcS],
  };
  Object.entries(argsMap).forEach(kv => {
    if (!exclude.includes(Number(kv[0]))) {
      assertEqual(kv[1][0], kv[1][1])
    } 
  });
}

// Test functionality, no leading zeroes, all positive values
const basic: ShortTestCase[] = [
  [ UNARY_VERTICAL_BAR, 1, "|"],
  [ UNARY_VERTICAL_BAR, 11, "|||||||||||"],
  [ BINARY, 0b1, "1"],
  [ BINARY, 0b1101, "1101"],
  [ BINARY, 0b1111111111111111, "1111111111111111"], // 16
  [ BINARY, 0b11111111111111111111111111111111, "11111111111111111111111111111111"], // 32
  [ BINARY, Number.MAX_SAFE_INTEGER, "11111111111111111111111111111111111111111111111111111"], // 53 1's
  [ BINARY_EMOJI, 13, "👍👍👎👍"],
  [ OCTAL, 0o137710, "137710"],
  [ HEXA_UPPER, 0xf7ec7, "F7EC7"],
  [ HEXA_LOWER, 0xa7bf7, "a7bf7"],
  [ DECIMAL, 13, "13"],
  [ DECIMAL, 1257, "1257"],
  [ DECIMAL, 256, "256"],
  [ DECIMAL, 1, "1"],
  [ DECIMAL, 12312300, "12312300"],
  [ DECIMAL, 6, "6"],
  [ DECIMAL, 215121, "215121"],
  [ DECIMAL, Number.MAX_SAFE_INTEGER, "9007199254740991"],
];

basic.forEach(makeRunner([]));

// Encoding should not be tested here (leading zeroes), neither s2s (leading zeroes)
const leadingZeroes: ShortTestCase[] = [
  [ BINARY, 0b1, "01"],
  [ BINARY, 0b1101, "00000001101"],
  [ BINARY_EMOJI, 0b1101, "👎👎👎👎👎👎👍👍👎👍"],
  [ DECIMAL, 7, "0000007"],
  [ DECIMAL, 999129, "0000000999129"],
  [ DECIMAL, 11, "011"],
  [ HEXA_LOWER, 0x112f, "000112f"],
  [ OCTAL, 0o11277, "000011277"],
];

leadingZeroes.forEach(makeRunner([
  Assertion.encoding, // leading zeroes
  Assertion.negEncoding, // leading zeroes
  Assertion.s2s, // leading zeroes
  Assertion.s2sNeg, // leading zeroes
  Assertion.s2sPos, // leading zeroes
]));

leadingZeroes.map(makeTestCase).forEach(tc => {
  const zero = [...tc.s][0];
  const leadingZeroRegex = new RegExp(`^(${zero})*`);
  const stripped = tc.s.replace(leadingZeroRegex, "");
  const converter = new Converter(tc.digits);
  assertEqual(converter.encode(tc.n), stripped);
  assertEqual(converter.encode(-tc.n), "-"+stripped);
  assertEqual(converter.encode(converter.decode(tc.s)), stripped)
  assertEqual(converter.encode(converter.decode("-"+tc.s)), "-"+stripped)
  assertEqual(converter.encode(converter.decode("+"+tc.s)), stripped)
})

// Encoding should not be tested here (leading zeroes),
// neither should s2s (leading zeroes and 0 = -0)
const zeroes: ShortTestCase[] = [
  [ UNARY_VERTICAL_BAR, 0, ""],
  [ BINARY, 0b0, "0"],
  [ BINARY_EMOJI, 0, "👎"],
  [ DECIMAL, 0, "0"],
  [ BASE62, 0, "A"]
];

zeroes.forEach(makeRunner([
  Assertion.negEncoding, // we want -0 to become "0", not "-0"
  Assertion.s2sNeg, // we want "-0" to become "0", not "-0"
]));

zeroes.map(makeTestCase).forEach(tc => {
  const converter = new Converter(tc.digits);
  const zero = tc.digits.length === 1 ? "" : [...tc.digits][0];
  assertEqual(converter.encode(-tc.n), zero);
  assertEqual(converter.encode(converter.decode("-"+tc.s)), zero)
});

const multipleZeroes: ShortTestCase[] = [
  [ BINARY, 0b0, "000000"],
  [ BINARY_EMOJI, 0, "👎👎👎👎👎"],
  [ DECIMAL, 0, "00"],
  [ BASE62, 0, "AAA"]
]

multipleZeroes.forEach(makeRunner([
  Assertion.encoding, // we want -0 to become "0", not "000"
  Assertion.negEncoding, // we want -0 to become "0", not "-000"
  Assertion.s2s, // leading zeroes
  Assertion.s2sNeg, // leading zeroes
  Assertion.s2sPos, // leading zeroes
]));

multipleZeroes.map(makeTestCase).forEach(tc => {
  const converter = new Converter(tc.digits);
  const zero: string = [...tc.digits][0];
  assertEqual(converter.encode(-tc.n), zero);
  assertEqual(converter.encode(tc.n), zero);
  ["", "-", "+"].forEach(prefix => {
    assertEqual(encode(tc.digits, decode(tc.digits, prefix+tc.s)), [...tc.s][0]);
  })
})

// Special tests for the alphabet containing + and -.
assertEqual(5, decode(BINARY_SIGNS, "++-+")); // +-+
assertEqual(13, decode(BINARY_SIGNS, "+++-+")); // ++-+
assertEqual(-13, decode(BINARY_SIGNS, "-++-+")); // -(++-+)
assertEqual(-13, decode(BINARY_SIGNS, "--++-+")); // -(-++-+)
assertEqual(-13, decode(BINARY_SIGNS, "---++-+")); // -(--++-+)

// Error testing
assert.throws(() => {
  new Converter(""); 
});

assert.throws(() => {
  new Converter("123451"); // duplicate 1
});

assert.throws(() => {
  new Converter("123").decode("0121"); // invalid digit 0
});

assert.throws(() => {
  new Converter("0123").decode("1412"); // invalid digit 4
});

[
  UNARY_VERTICAL_BAR,
  BINARY, 
  BINARY_EMOJI,
  OCTAL,
  DECIMAL,
  HEXA_LOWER,
  HEXA_UPPER,
  BASE62,
  BASE64,
].forEach(system => {
  [
    -Math.pow(2, 56.1231), 
    Number.MIN_SAFE_INTEGER - 1, 
    Number.MAX_SAFE_INTEGER + 1,
    Math.pow(2, 68.5),
  ].forEach(n => {
    assert.throws(() => new Converter(system).encode(n))
  })
});

assert.throws(() => {
  // 1 and 53 0's, MAX_SAFE_INTEGER + 1
  let s = "100000000000000000000000000000000000000000000000000000";
  new Converter("01").decode(s);
});

assert.throws(() => {
  // -1 and 53 0's, MIN_SAFE_INTEGER - 1
  let s = "-100000000000000000000000000000000000000000000000000000"; 
  new Converter("01").decode(s);
});

assert.throws(() => {
  new Converter(DECIMAL).decode("9007199254740992"); // MAX_SAFE_INTEGER + 1
});

assert.throws(() => {
  new Converter(DECIMAL).decode("-9007199254740992"); // MAX_SAFE_INTEGER - 1
});
