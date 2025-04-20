import test from "node:test";
import assert from "node:assert";
import { parseRec2, typeShow } from "npm:tiny-ts-parser";
import { typecheck } from "./rec2.ts";

function run(code: string) {
  return typecheck(parseRec2(code), {});
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
    "number",
    `
  type A = { tag: "ab", val: B } | { tag: "ac", val: C };
  type B = { tag: "bc", val: C } | { tag: "ba", val: A };
  type C = { tag: "ca", val: A } | { tag: "cb", val: B };
  function f(a: A): boolean {
    return true;
  }
  function g(b: B, c: C): boolean {
    const newA = <A>{ tag: "ab", val: b };
    return f(newA);
  }
  1;
`,
  ));

test("numlist", () =>
  ok(
    "{ " +
      `isnil: (l: (mu NumList. ({ tag: "cons"; num: number; tail: NumList } | { tag: "nil" }))) => boolean; ` +
      `hd: (l: (mu NumList. ({ tag: "cons"; num: number; tail: NumList } | { tag: "nil" }))) => number; ` +
      `tl: (l: (mu NumList. ({ tag: "cons"; num: number; tail: NumList } | { tag: "nil" }))) => ` +
      `(mu NumList. ({ tag: "cons"; num: number; tail: NumList } | { tag: "nil" })); ` +
      `sum: (l: (mu NumList. ({ tag: "cons"; num: number; tail: NumList } | { tag: "nil" }))) => number; ` +
      `hd_tl_result: number; ` +
      `sum_result: number ` +
      "}",
    `
  type NumList =
    | { tag: "cons"; num: number; tail: NumList }
    | { tag: "nil" }
  ;
  const cons = (num: number, tail: NumList) => {
    return <NumList>{ tag: "cons", num: num, tail: tail };
  };
  const nil = <NumList>{ tag: "nil" };
  const isnil = (l: NumList) => {
    switch (l.tag) {
      case "cons":
        return false;
      case "nil":
        return true;
    }
  };
  const hd = (l: NumList) => {
    switch (l.tag) {
      case "cons":
        return l.num;
      case "nil":
        return 0; /* dummy */
    }
  };
  const tl = (l: NumList) => {
    switch (l.tag) {
      case "cons":
        return l.tail;
      case "nil":
        return nil;
    }
  };
  function sum(l: NumList): number {
    if (isnil(l))
      return 0;
    else
      return hd(l) + sum(tl(l));
  }
  const l = cons(1, cons(2, cons(3, nil)));
  ({
    isnil,
    hd,
    tl,
    sum,
    hd_tl_result: hd(tl(tl(tl(l)))),
    sum_result: sum(l),
  });
`,
  ));
