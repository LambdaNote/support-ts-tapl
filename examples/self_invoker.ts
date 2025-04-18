/// <reference lib="deno.ns" />
import { parseSelf } from "../tiny-ts-parser.ts";
import { typecheck } from "./self.ts";

typecheck(parseSelf(Deno.readTextFileSync(Deno.args[0])), {});
