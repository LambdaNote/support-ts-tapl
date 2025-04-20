import test from "node:test";
import assert from "node:assert";
import { parseBasic, typeShow } from "npm:tiny-ts-parser";
import { typecheck } from "./basic.ts";

function run(code: string) {
  return typecheck(parseBasic(code), {});
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

test("func", () => ok("(x: number, y: number) => boolean", `(x: number, y: number) => true`));
test("call", () => ok("boolean", `( (x: number, y: number) => true )(1, 2)`));
test("call error", () => ng(/test.ts:1:40-1:41 parameter type mismatch/, `( (x: number, y: boolean) => true )(1, 2)`));
test("var", () => ok("number", `((x: number, y: number) => x)(1, 2)`));
test("var error", () => ng(/test.ts:1:28-1:29 unknown variable: z/, `((x: number, y: number) => z)(1, 2)`));
test("func func", () => ok("(f: (x: number) => number) => number", `( (f: (x: number) => number) => f(42) )`));

test("seq 1", () => ok("number", `1; 2; 3`));
test("seq 2", () => ok("boolean", `1; 2; true`));
test("const 1", () =>
  ok(
    "number",
    `
  const x = 1;
  const y = 2;
  x + y;
`,
  ));

test("const 2", () =>
  ok(
    "number",
    `
  const f = (x: number, y: number) => x + y;
  f(1, 2);
`,
  ));
test("const error 1", () =>
  ng(
    /./,
    `
  const f = (x: number, y: number) => x + y;
  f(1, true);
`,
  ));
test("const error 2", () =>
  ng(
    /./,
    `
  const fib = (n: number) => {
    return fib(n + 1) + fib(n);
  };
  fib(1)
`,
  ));
