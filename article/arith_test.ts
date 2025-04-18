import { generateTestUtils, parseArith } from "./utils.ts";
import { typecheck } from "./arith.ts";

const { ok, ng } = generateTestUtils((code) => typecheck(parseArith(code)));

Deno.test("true", () => ok("boolean", `true`));
Deno.test("false", () => ok("boolean", `false`));
Deno.test("if", () => ok("number", `true ? 1 : 2`));
Deno.test("if error", () => ng("test.ts:1:1-1:16 then and else have different types", `true ? 1 : true`));

Deno.test("number", () => ok("number", `1`));
Deno.test("add", () => ok("number", `1 + 2`));
Deno.test("add error", () => ng("test.ts:1:1-1:2 number expected", `1 + true`));
