import test from "node:test";
import assert from "node:assert";
import { parseRec, typeShow } from "npm:tiny-ts-parser";
import { typecheck } from "./rec.ts";

function run(code: string) {
  return typecheck(parseRec(code), {});
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

test("rec hungry 1", () =>
  ok(
    "(f: (mu Hungry. (x: number) => Hungry)) => (mu Hungry. (x: number) => Hungry)",
    `
  type Hungry = (x: number) => Hungry;
  (f: Hungry) => {
    return f(0)(1)(2)(3)(4)(5);
  }
`,
  ));

test("rec hungry 2", () =>
  ok(
    "(mu Hungry. (x: number) => Hungry)",
    `
  type Hungry = (x: number) => Hungry;
  function hungry(x: number): Hungry {
    return hungry;
  }
  hungry(0)(1)(2)(3)(4)(5);
`,
  ));

test("fib", () =>
  ok(
    "(mu NumStream. { num: number; rest: () => NumStream })",
    `
type NumStream = { num: number; rest: () => NumStream };

function numbers(n: number): NumStream {
    return { num: n, rest: () => numbers(n + 1) };
}

const ns1 = numbers(1);
const ns2 = (ns1.rest)();
const ns3 = (ns2.rest)();
ns3
`,
  ));

test("mutual recursion 1", () =>
  ok(
    "number",
    `
  type A = { aa: B };
  type B = { bb: A };
  function f(x: A): boolean {
    return f({ aa: { bb: x } });
  }
  1;
`,
  ));

test("mutual recursion 2", () =>
  ng(
    /test.ts:5:14-5:39 parameter type mismatch/,
    `
  type A = { aa: B };
  type B = { bb: A };
  function f(x: A): boolean {
    return f({ aa: { bb: { aa: x } } });
  }
  1;
`,
  ));

test("mutual recursion 3", () =>
  ok(
    "(b: (mu B. { b: { a: B } })) => boolean",
    `
  type A = { a: { b: A } };
  type B = { b: { a: B } };
  const f = (x: A): boolean => true;
  (b: B) => f({ a: b });
`,
  ));
