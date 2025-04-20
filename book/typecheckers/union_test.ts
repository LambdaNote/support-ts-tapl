import test from "node:test";
import assert from "node:assert";
import { parseTaggedUnion, typeShow } from "npm:tiny-ts-parser";
import { typecheck } from "./union.ts";

function run(code: string) {
  return typecheck(parseTaggedUnion(code), {});
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

test("tagged union", () =>
  ok(
    "number",
    `
  type NumOrBoolean = { tag: "num", num: number } | { tag: "bool", bool: boolean };
  const v = { tag: "num", num: 42 } satisfies { tag: "num", num: number } | { tag: "bool", bool: boolean };
  switch (v.tag) {
    case "num": {
      v.num + 1;
    }
    case "bool": {
      v.bool ? 1 : 2;
    }
  }
`,
  ));
test("tagged union error 1", () =>
  ng(
    /test.ts:3:32-3:36 tagged union's term has a wrong type/,
    `
  type NumOrBoolean = { tag: "num", num: number } | { tag: "bool", bool: boolean };
  const v = { tag: "num", num: true } satisfies NumOrBoolean;
  1;
`,
  ));
test("tagged union error 2", () =>
  ng(
    /test.ts:3:13-3:62 unknown property: bool/,
    `
  type NumOrBoolean = { tag: "num", num: number } | { tag: "bool", bool: boolean };
  const v = { tag: "num", bool: true } satisfies NumOrBoolean;
  1;
`,
  ));
test("tagged union error 3", () =>
  ng(
    /test.ts:3:3-7:4 variable v must have a tagged union type/,
    `
  const v = 1;
  switch (v.tag) {
    case "num": {
      v.val + 1;
    }
  }
`,
  ));
test("tagged union error 4", () =>
  ng(
    /test.ts:12:7-12:20 tagged union type has no case: unknown/,
    `
  type NumOrBoolean = { tag: "num", val: number } | { tag: "bool", val: boolean };
  const v = { tag: "num", val: 42 } satisfies NumOrBoolean;
  switch (v.tag) {
    case "num": {
      v.val + 1;
    }
    case "bool": {
      v.val ? 1 : 2;
    }
    case "unknown": {
      v.val ? 1 : 2;
    }
  }
`,
  ));
test("tagged union error 5", () =>
  ng(
    /test.ts:9:16-9:21 clauses has different types/,
    `
  type NumOrBoolean = { tag: "num", val: number } | { tag: "bool", val: boolean };
  const dispatch = (v: NumOrBoolean) => {
    switch (v.tag) {
      case "num": {
        return v.val;
      }
      case "bool": {
        return v.val;
      }
    }
  };
`,
  ));
