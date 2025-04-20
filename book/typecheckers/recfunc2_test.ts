import test from "node:test";
import assert from "node:assert";
import { parseRecFunc, typeShow } from "npm:tiny-ts-parser";
import { typecheck } from "./recfunc2.ts";

function run(code: string) {
  return typecheck(parseRecFunc(code), {});
}
function ok(expected: string, code: string) {
  assert.equal(expected, typeShow(run(code)));
}
function ng(expected: RegExp, code: string) {
  assert.throws(() => {
    run(code);
    return true;
  }, expected);
}

test("recursive func", () =>
  ng(
    /test.ts:1:25-1:26 wrong return type/,
    `(x: number): boolean => x`,
  ));
test("recursive func", () =>
  ok(
    "(n: number) => number",
    `
      const fib = (n: number): number => {
        return fib(n + 1) + fib(n);
      }
      fib;
    `,
  ));
