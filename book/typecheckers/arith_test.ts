import test from "node:test";
import assert from "node:assert";
import { parseArith, typeShow } from "npm:tiny-ts-parser";
import { typecheck } from "./arith.ts";

function run(code: string) {
  return typecheck(parseArith(code));
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

test("true", () => ok("boolean", `true`));
test("false", () => ok("boolean", `false`));
test("if", () => ok("number", `true ? 1 : 2`));
test("if error", () => ng(/test.ts:1:1-1:16 then and else have different types/, `true ? 1 : true`));

test("number", () => ok("number", `1`));
test("add", () => ok("number", `1 + 2`));
test("add error 1", () => ng(/test.ts:1:1-1:5 number expected/, `true + 1`));
test("add error 2", () => ng(/test.ts:1:5-1:9 number expected/, `1 + true`));
