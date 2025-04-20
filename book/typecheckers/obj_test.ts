import test from "node:test";
import assert from "node:assert";
import { parseObj, typeShow } from "npm:tiny-ts-parser";
import { typecheck } from "./obj.ts";

function run(code: string) {
  return typecheck(parseObj(code), {});
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

test("object 1", () => ok("{ a: number; b: boolean }", `({ a: 1, b: true });`));
test("object 2", () =>
  ok(
    "number",
    `
  const obj = { a: 1, b: true };
  obj.a;
`,
  ));
test("object 3", () =>
  ok(
    "boolean",
    `
  const obj = { a: 1, b: true };
  obj.b;
`,
  ));
test("object error 1", () =>
  ng(
    /test.ts:3:3-3:8 unknown property name: c/,
    `
  const obj = { a: 1, b: true };
  obj.c;
`,
  ));
test("object error 2", () =>
  ng(
    /test.ts:3:5-3:8 object type expected/,
    `
    const obj = 42;
    obj.b;
`,
  ));
