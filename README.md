# tiny-ts-parser

A lightweight library featuring parsers for multiple minimal subsets of TypeScript, designed for the Japanese book named "...".

## How to use

```ts
import { parseArith } from "npm:tiny-ts-parser";

console.log(parseArith("100"));
```

```sh
$ deno run -A test.ts ⏎
{
  tag: "number",
  n: 100,
  loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } }
}
```

## How to test (deno)

```
deno install
deno test -A
```

## How to test (node)

```
npm install
npm run build
cd examples
npm install
node --test
```

## How to publish

```
npm install
npm run build
npm publish
```