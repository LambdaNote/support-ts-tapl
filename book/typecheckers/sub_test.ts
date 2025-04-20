import test from "node:test";
import assert from "node:assert";
import { parseSub, typeShow } from "npm:tiny-ts-parser";
import { typecheck } from "./sub.ts";

function run(code: string) {
  return typecheck(parseSub(code), {});
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

test("record sub 1", () =>
  ok(
    "number",
    `
  type R1 = { a: number };
  const f = (r: R1) => r.a;
  f({ a: 1, b: 1 });
`,
  ));
test("record sub 2", () =>
  ok(
    "number",
    `
  type R1 = { a: number };
  const f = (r: R1) => 1;
  const x = { a: 1, b: true };
  f(x)
`,
  ));
test("record sub 3", () =>
  ok(
    "number",
    `
  type R1 = { a: number };
  const f = (r: R1) => 1;
  f({ a: 1, b: true }); // type error in TS
`,
  ));
test("record sub 4", () =>
  ok(
    "number",
    `
  type R1 = { a: number };
  type R2 = { a: number; b: number };
  type R3 = { a: number; b: number; c: number };
  const g = (f: (_: R2) => R2) => 1;
  const f = (_: R1) => ({ a: 1, b: 2, c: 3 });
  g(f);
`,
  ));
test("record sub error 1", () =>
  ng(
    /test.ts:7:5-7:6 parameter type mismatch/,
    `
  type R1 = { a: number };
  type R2 = { a: number; b: number };
  type R3 = { a: number; b: number; c: number };
  const g = (f: (_: R2) => R2) => 1;
  const f = (_: R3) => ({ a: 1, b: 2, c: 3 });
  g(f);
`,
  ));

test("record sub error 2", () =>
  ng(
    /test.ts:7:5-7:6 parameter type mismatch/,
    `
  type R1 = { a: number };
  type R2 = { a: number; b: number };
  type R3 = { a: number; b: number; c: number };
  const g = (f: (_: R2) => R2) => 1;
  const f = (_: R1) => ({ a: 1 });
  g(f);
`,
  ));
/*
test("if", () => ok("{ a: number; b: number }", `
  true ? { a: 1, b: 2 } : { a: 2, b: 1 }
`));
*/
