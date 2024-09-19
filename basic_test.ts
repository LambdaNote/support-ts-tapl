import { generateTestUtils, parseBasic } from "./utils.ts";
import { typecheck } from "./basic.ts";

const { ok, ng } = generateTestUtils((code) => typecheck(parseBasic(code), {}));

Deno.test("func", () => ok("(x: number, y: number) => boolean", `(x: number, y: Number) => true`));
Deno.test("call", () => ok("boolean", `( (x: number, y: number) => true )(1, 2)`));
Deno.test("call error", () => ng("test.ts:1:40-1:41 parameter type mismatch", `( (x: number, y: boolean) => true )(1, 2)`));
Deno.test("var", () => ok("number", `((x: number, y: number) => x)(1, 2)`));
Deno.test("var error", () => ng("test.ts:1:28-1:29 unknown variable: z", `((x: number, y: number) => z)(1, 2)`));
Deno.test("func func", () => ok("(f: (x: number) => number) => number", `( (f: (x: number) => number) => f(42) )`))

Deno.test("seq 1", () => ok("number", `1; 2; 3`));
Deno.test("seq 2", () => ok("boolean", `1; 2; true`));
Deno.test("const 1", () => ok("number", `
  const x = 1;
  const y = 2;
  x + y;
`));

Deno.test("const 2", () => ok("number", `
  const f = (x: number, y: number) => x + y;
  f(1, 2);
`));
Deno.test("const error 1", () => ng("", `
  const f = (x: number, y: number) => x + y;
  f(1, true);
`));
Deno.test("const error 2", () => ng("", `
  const fib = (n: number) => {
    return fib(n + 1) + fib(n);
  };
  fib(1)
`));
