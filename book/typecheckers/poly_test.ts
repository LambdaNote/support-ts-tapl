import test from "node:test";
import assert from "node:assert";
import { parsePoly, typeShow } from "npm:tiny-ts-parser";
import { typecheck } from "./poly.ts";

function run(code: string) {
  return typecheck(parsePoly(code), {}, []);
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

test("test 1", () =>
  ok(
    "number",
    `
  const f = <X>(x: X) => x;
  const g = <Y>(x: Y) => f<Y>(x);
  g<number>(1);
`,
  ));
test("lower tyvar name", () =>
  ok(
    "number",
    `
const g = <x>(x: x) => x;
const f = <x>(x: x) => g<x>(x);
const r = f<number>(0);
r
`,
  ));
test("tyvar capture", () =>
  ok(
    "<X>(_x: X) => (f: <X@1>(z: X@1) => X) => X",
    `
const g = <Y>(f: <X>(z: X) => Y) => f<boolean>(true);
const f = <X>(_x: X) => g<X>;
f;
`,
  ));
test("test 2", () =>
  ok(
    "<Z@3>(x: Z@3) => Z@3",
    `
  const f = <X>(x: <Z>(x: Z) => Z) => x;
  const g = <Y>(x: Y) => x;
  f<<W>(x: W) => W>(g);
`,
  ));
test("type abs 1", () => ok("<X>(x: X) => X", `<X>(x: X) => x`));
test("type abs 2", () => ok("(f: <X>(x: X) => X) => number", `(f: <X>(x: X) => X) => 1`));
test("type abs 3", () =>
  ok(
    "(f: <X>(x: X) => boolean) => number",
    `
  type F = <X>(x: X) => G;
  type G = X;
  type X = boolean;
  (f: F) => 1;
`,
  ));
test("type abs 4", () =>
  ok(
    "number",
    `
  const f = <X>() => {
    return (x: X) => x;
  }
  f<number>()(1)
`,
  ));
test("type app 1", () =>
  ok(
    "(x: number) => number",
    `
  const f = <X>(x: X) => x;
  f<number>;
`,
  ));
test("type app 2", () =>
  ok(
    "number",
    `
  const f = <X>(x: X) => x;
  f<number>(0);
`,
  ));

test("type app 3", () =>
  ok(
    "boolean",
    `
  const f = <X>(x: X) => x;
  f<boolean>(true);
`,
  ));
test("type app 4", () =>
  ok(
    "number",
    `
  const f = (f: <X>(x: X) => X) => 1;
  const g = <Y>(y: Y) => y;
  f(g);
`,
  ));
test("type app 5", () =>
  ng(
    /test.ts:4:5-4:6 parameter type mismatch/,
    `
  const f = (f: <X>(x: X) => X) => 1;
  const g = <Y>(y: Y) => 1;
  f(g);
`,
  ));
test("type param 1", () =>
  ok(
    "(f: (x: number) => boolean) => number",
    `
  type F<X> = (x: X) => boolean;
  (f: F<number>) => 1;
`,
  ));
test("type param 2", () =>
  ok(
    "(f: { b: { a: boolean } }) => number",
    `
  type F<X> = G<{a: X}>;
  type G<X> = {b: X};
  (f: F<boolean>) => 1;
`,
  ));
test("type param 3", () =>
  ok(
    "(f: { a: boolean; b: number }) => number",
    `
  type F<X, Y> = {a: X, b: Y};
  (f: F<boolean, number>) => 1;
`,
  ));
test("type param error 1", () =>
  ng(
    /test.ts:2:15-2:24 not a generic type: X/,
    `
  type F<X> = X<number>;
  (f: F<boolean>) => 1;
`,
  ));
test("type param error 2", () =>
  ng(
    /test.ts:2:25-2:34 type recursion for generics is not supported/,
    `
  type F<X> = (x: X) => F<number>;
  (f: F<boolean>) => 1;
`,
  ));
test("type param error 3", () =>
  ng(
    /test.ts:2:15-2:24 unbound type variable: G/,
    `
  type F<X> = G<number>;
  (f: F<boolean>) => 1;
`,
  ));
test("type param error 4", () =>
  ng(
    /test.ts:2:15-2:24 not a generic type: G/,
    `
  type F<X> = G<number>;
  type G = <X>() => X;
  (f: F<boolean>) => 1;
`,
  ));
test("type param error 5", () =>
  ng(
    /test.ts:2:15-2:32 not a generic type: G/,
    `
  type F<X> = G<number, number>;
  type G = <X>() => X;
  (f: F<boolean>) => 1;
`,
  ));
test("type param error 6", () =>
  ng(
    /test.ts:2:15-2:16 unbound type variable: G/,
    `
  type F<X> = G;
  (f: F<boolean>) => 1;
`,
  ));
test("type param error 7", () =>
  ng(
    /test.ts:2:15-2:16 type arguments are required for G/,
    `
  type F<X> = G;
  type G<X> = number;
  (f: F<boolean>) => 1;
`,
  ));

test("type application to non var", () =>
  ok(
    "number",
    `
  const f = <X>(x: X) => x;
  const g = () => f;
  g()<number>(1);
`,
  ));