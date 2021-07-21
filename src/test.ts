import Converter from "./index";
import { strict as assert } from 'assert';
import * as systems from './systems';

interface TestCase {
  digits: string,
  n: number, 
  s: string,
}

const testCases: TestCase[] = [
  { digits: systems.UNARY_VERTICAL_BAR, n: 0, s: ""},
  { digits: systems.UNARY_VERTICAL_BAR, n: 1, s: "|"},
  { digits: systems.UNARY_VERTICAL_BAR, n: 11, s: "|||||||||||"},
  { digits: systems.BINARY, n: 0, s: "0"},
  { digits: systems.BINARY, n: 1, s: "1"},
  { digits: systems.BINARY, n: 13, s: "1101"},
  { digits: systems.BINARY_EMOJI, n: 13, s: "👍👍👎👍"},
  { digits: systems.DECIMAL, n: 13, s: "13"},
  { digits: systems.DECIMAL, n: 1257, s: "1257"},
  { digits: systems.DECIMAL, n: 256, s: "256"},
  { digits: systems.DECIMAL, n: 1, s: "1"},
  { digits: systems.DECIMAL, n: 0, s: "0"},
  { digits: systems.DECIMAL, n: 999129, s: "999129"},
  { digits: systems.DECIMAL, n: 6, s: "6"},
];

testCases.forEach(tc => {
  const converter = new Converter(tc.digits);
  const s = converter.encode(tc.n);
  const n = converter.decode(tc.s);
  const s2s = converter.encode(n);
  const n2n = converter.decode(s);
  assert.equal(s, tc.s, "encoding");
  assert.equal(n, tc.n, "decoding");
  assert.equal(s2s, tc.s, "decoding-encoding-identity");
  assert.equal(n2n, tc.n, "encoding-decoding-identity");
});