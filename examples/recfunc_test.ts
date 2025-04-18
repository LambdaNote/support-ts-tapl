import test from "node:test";
import assert from "node:assert";
import { parseRecFunc, typeShow } from "tiny-ts-parser";
import { typecheck } from "./recfunc.ts";

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
  ok(
    "(n: number) => number",
    `
  function fib(n: number): number {
    return fib(n + 1) + fib(n);
  }
  fib;
`,
  ));
test("recursive func error", () =>
  ng(
    /wrong return type/,
    `
  function f(): number {
    return true;
  }
  f;
`,
  ));
