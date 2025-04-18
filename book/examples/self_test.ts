import test from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseSelf, typeShow } from "tiny-ts-parser";
import { typecheck } from "./self.ts";

function run(code: string) {
  return typecheck(parseSelf(code), {});
}
function ok(expected: string, code: string) {
  assert.equal(expected, typeShow(run(code)));
}

const self = readFileSync(join(dirname(fileURLToPath((import.meta as any).url)), "self.ts")).toString();
test("self-hosting", () => ok(`number`, self));
