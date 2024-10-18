import p from "npm:@typescript-eslint/typescript-estree@7.11.0";
import { assertEquals, assertThrows } from "https://deno.land/std@0.224.0/assert/mod.ts";

type Position = { line: number; column: number };
type Location = { start: Position; end: Position };

export type Type =
  | { loc?: Location; tag: "Boolean" } // boolean
  | { loc?: Location; tag: "Number" } // number
  | { loc?: Location; tag: "Func"; params: Param[]; retType: Type } // (_: T0, ...) => T
  | { loc?: Location; tag: "Object"; props: PropertyType[] } // { s0: T0, ... }
  | { loc?: Location; tag: "TaggedUnion"; variants: VariantType[] } // { tag: "s0", val: T } | ...
  | { loc?: Location; tag: "Rec"; name: string; type: Type } // mu V. T
  | { loc?: Location; tag: "Forall"; typeParams: string[]; type: Type } // <V0, ...>T
  | { loc?: Location; tag: "TypeVar"; name: string; typeArgs?: Type[] } // V
;

type Param = { name: string; type: Type };
type PropertyType = { name: string; type: Type };
type VariantType = { label: string; type: Type };

type Term =
  | { loc: Location; tag: "true" }
  | { loc: Location; tag: "false" }
  | { loc: Location; tag: "if"; cond: Term; thn: Term; els: Term }
  | { loc: Location; tag: "number"; n: number }
  | { loc: Location; tag: "add"; left: Term; right: Term }
  | { loc: Location; tag: "var"; name: string }
  | { loc: Location; tag: "func"; params: Param[]; body: Term }
  | { loc: Location; tag: "call"; func: Term; args: Term[] }
  | { loc: Location; tag: "seq"; body: Term; rest: Term }
  | { loc: Location; tag: "const"; name: string; init: Term; rest: Term }
  | { loc: Location; tag: "objectNew"; props: PropertyTerm[] }
  | { loc: Location; tag: "objectGet"; obj: Term; propName: string }
  | { loc: Location; tag: "taggedUnionNew"; label: string; term: Term; as: Type }
  | { loc: Location; tag: "taggedUnionGet"; varName: string; clauses: VariantTerm[] }
  | { loc: Location; tag: "recFunc"; funcName: string; params: Param[]; retType: Type; body: Term; rest: Term }
  | { loc: Location; tag: "typeAbs"; typeParams: string[]; body: Term }
  | { loc: Location; tag: "typeApp"; typeAbs: Term; typeArgs: Type[] };

type PropertyTerm = { name: string; term: Term };
type VariantTerm = { label: string; term: Term };

type TypeAliasMap = Record<string, { typeParams: string[] | null; type: Type }>;
type TypeVarBindings = Record<string, Type>;
type Context = {
  globalTypeAliasMap: TypeAliasMap;
  typeVarBindings: TypeVarBindings;
};

export function typeShow(ty: Type): string {
  switch (ty.tag) {
    case "Boolean":
      return "boolean";
    case "Number":
      return "number";
    case "Func": {
      const params = ty.params.map(({ name, type }) => `${name}: ${typeShow(type)}`);
      return `(${params.join(", ")}) => ${typeShow(ty.retType)}`;
    }
    case "Object": {
      const props = ty.props.map(({ name, type }) => `${name}: ${typeShow(type)}`);
      return `{ ${props.join(", ")} }`;
    }
    case "TaggedUnion": {
      const variants = ty.variants.map(({ label, type }) => `{ tag: "${label}", val: ${typeShow(type)} }`);
      return `(${variants.join(" | ")})`;
    }
    case "Rec":
      return `(mu ${ty.name}. ${typeShow(ty.type)})`;
    case "Forall":
      return `<${ty.typeParams.join(", ")}>${typeShow(ty.type)}`;
    case "TypeVar":
      return ty.name;
  }
}

function freeTyVars(ty: Type): Set<string> {
  switch (ty.tag) {
    case "Boolean":
    case "Number":
      return new Set();
    case "Func":
      return ty.params.reduce((r, { type }) => r.union(freeTyVars(type)), freeTyVars(ty.retType));
    case "Object":
      return ty.props.reduce((r, { type }) => r.union(freeTyVars(type)), new Set<string>());
    case "TaggedUnion":
      return ty.variants.reduce((r, { type }) => r.union(freeTyVars(type)), new Set<string>());
    case "Rec":
      return freeTyVars(ty.type).difference(new Set([ty.name]));
    case "Forall":
      return freeTyVars(ty.type).difference(new Set(ty.typeParams));
    case "TypeVar":
      return new Set([ty.name]);
  }
}

function addDefinedTypeVars(tyVars: string[], ctx: Context): Context {
  return {
    globalTypeAliasMap: ctx.globalTypeAliasMap,
    typeVarBindings: tyVars.reduce(
      (bindings, name) => ({ ...bindings, [name]: { tag: "TypeVar", name } }),
      ctx.typeVarBindings,
    ),
  };
}

function expandTypeAliases(ty: Type, recDefined: Set<string>, ctx: Context): Type {
  switch (ty.tag) {
    case "Boolean":
      return { tag: "Boolean" };
    case "Number":
      return { tag: "Number" };
    case "Func": {
      const params = ty.params.map(({ name, type }) => ({ name, type: expandTypeAliases(type, recDefined, ctx) }));
      const retType = expandTypeAliases(ty.retType, recDefined, ctx);
      return { tag: "Func", params, retType };
    }
    case "Object": {
      const props = ty.props.map(({ name, type }) => ({ name, type: expandTypeAliases(type, recDefined, ctx) }));
      return { tag: "Object", props };
    }
    case "TaggedUnion": {
      const variants = ty.variants.map(({ label, type }) => ({
        label,
        type: expandTypeAliases(type, recDefined, ctx),
      }));
      return { tag: "TaggedUnion", variants };
    }
    case "Rec": {
      const newCtx = addDefinedTypeVars([ty.name], ctx);
      return { tag: "Rec", name: ty.name, type: expandTypeAliases(ty.type, recDefined, newCtx) };
    }
    case "Forall": {
      const newCtx = addDefinedTypeVars(ty.typeParams, ctx);
      return { tag: "Forall", typeParams: ty.typeParams, type: expandTypeAliases(ty.type, recDefined, newCtx) };
    }
    case "TypeVar": {
      const typeArgs = ty.typeArgs;
      if (typeArgs) {
        if (ty.name in ctx.typeVarBindings) error(`not a generic type: ${ty.name}`, ty);
        if (recDefined.has(ty.name)) error(`type recursion for generics is not supported`, ty);
        if (!(ty.name in ctx.globalTypeAliasMap)) error(`unbound type variable: ${ty.name}`, ty);
        const { typeParams, type } = ctx.globalTypeAliasMap[ty.name];
        if (!typeParams) error(`not a generic type: ${ty.name}`, ty);
        if (typeParams.length !== typeArgs.length) error(`wrong number of type arguments for ${ty.name}`, ty);
        const typeVarBindings = typeParams.reduce((bindings, typeParam, i) => {
          return { ...bindings, [typeParam]: expandTypeAliases(typeArgs[i], recDefined, ctx) };
        }, ctx.typeVarBindings);
        const newCtx: Context = {
          globalTypeAliasMap: ctx.globalTypeAliasMap,
          typeVarBindings,
        };
        const retTy = expandTypeAliases(type, recDefined.union(new Set([ty.name])), newCtx);
        if (freeTyVars(retTy).has(ty.name)) error("bug?", ty);
        return retTy;
      } else {
        if (ty.name in ctx.typeVarBindings) return ctx.typeVarBindings[ty.name];
        if (recDefined.has(ty.name)) return { tag: "TypeVar", name: ty.name };
        if (!(ty.name in ctx.globalTypeAliasMap)) error(`unbound type variable: ${ty.name}`, ty);
        const { typeParams, type } = ctx.globalTypeAliasMap[ty.name];
        if (typeParams) error(`type arguments are required for ${ty.name}`, ty);
        const newCtx: Context = {
          globalTypeAliasMap: ctx.globalTypeAliasMap,
          typeVarBindings: {},
        };
        const retTy = expandTypeAliases(type, recDefined.union(new Set([ty.name])), newCtx);
        return freeTyVars(retTy).has(ty.name) ? { tag: "Rec", name: ty.name, type: retTy } : retTy;
      }
    }
  }
}

function simplifyType(ty: Type, ctx: Context) {
  return expandTypeAliases(ty, new Set(), ctx);
}

function getIdentifier(node: p.TSESTree.Expression | p.TSESTree.PrivateIdentifier | p.TSESTree.TSQualifiedName) {
  if (node.type !== "Identifier") error("identifier expected", node);
  return node.name;
}

function getLiteralString(node: p.TSESTree.Expression) {
  if (node.type !== "Literal" || typeof node.value !== "string") error("", node);
  return node.value;
}

function getTypeProp(member: p.TSESTree.TypeElement) {
  if (member.type !== "TSPropertySignature" || member.key.type !== "Identifier" || !member.typeAnnotation) {
    error("object type must have only normal key-value paris", member);
  }
  return { key: member.key.name, type: member.typeAnnotation.typeAnnotation };
}

function getProp(property: p.TSESTree.ObjectLiteralElement) {
  if (property.type === "SpreadElement") error("spread operator is not allowed", property);
  if (property.computed) error("key must be bare", property);
  if (property.value.type === "AssignmentPattern") error("AssignmentPattern is not allowed", property);
  if (property.value.type === "TSEmptyBodyFunctionExpression") {
    error("TSEmptyBodyFunctionExpression is not allowed", property);
  }
  return { key: getIdentifier(property.key), value: property.value };
}

function getTagAndVal(node: p.TSESTree.ObjectExpression) {
  if (node.properties.length !== 2) error(`tagged union must be <TYPE>{ tag: "TAG", val: EXPR }`, node);
  const { key: s0, value: v0 } = getProp(node.properties[0]);
  const { key: s1, value: v1 } = getProp(node.properties[1]);
  if (s0 !== "tag" || s1 !== "val") error(`tagged union must be <TYPE>{ tag: "TAG", val: EXPR }`, node);

  return { tag: getLiteralString(v0), val: v1 };
}

function getSwitchVarName(node: p.TSESTree.Expression) {
  if (node.type !== "MemberExpression" || node.computed || getIdentifier(node.property) !== "tag") {
    error(`switch statement must be switch(VAR.tag) { ... }`, node);
  }
  return getIdentifier(node.object);
}

function getParam(node: p.TSESTree.Parameter): Param {
  if (node.type !== "Identifier") error("parameter must be a variable", node);
  if (!node.typeAnnotation) error("parameter type is required", node);
  const name = node.name;
  const type = convertType(node.typeAnnotation.typeAnnotation);
  return { name, type };
}

function getRecFunc(node: p.TSESTree.FunctionDeclaration, ctx: Context, restFunc: (() => Term) | null): Term {
  if (!node.id) error("function name is required", node);
  if (!node.returnType) error("function return type is required", node);
  const funcName = node.id.name;
  if (node.typeParameters) error("type parameter is not supported for function declaration", node);
  const params = node.params.map((param) => {
    const { name, type } = getParam(param);
    return { name, type: simplifyType(type, ctx) };
  });
  const retType = simplifyType(convertType(node.returnType.typeAnnotation), ctx);
  const body = convertStmts(node.body.body, true, ctx);
  const rest: Term = restFunc ? restFunc() : { tag: "var", name: funcName, loc: node.loc };
  return { tag: "recFunc", funcName, params, retType, body, rest, loc: node.loc };
}

function convertType(node: p.TSESTree.TypeNode): Type {
  switch (node.type) {
    case "TSBooleanKeyword":
      return { tag: "Boolean", loc: node.loc };
    case "TSNumberKeyword":
      return { tag: "Number", loc: node.loc };
    case "TSFunctionType": {
      if (!node.returnType) error("return type is required", node);
      const params = node.params.map((param) => getParam(param));
      const retType = convertType(node.returnType.typeAnnotation);
      const funcTy: Type = { tag: "Func", params, retType };
      if (!node.typeParameters) return funcTy;
      const typeParams = node.typeParameters.params.map((typeParameter) => typeParameter.name.name);
      return { tag: "Forall", typeParams, type: funcTy, loc: node.loc };
    }
    case "TSTypeLiteral": {
      const props = node.members.map((member) => {
        const { key, type } = getTypeProp(member);
        return { name: key, type: convertType(type) };
      });
      return { tag: "Object", props, loc: node.loc };
    }
    case "TSUnionType": {
      const variants = node.types.map((variant) => {
        if (variant.type !== "TSTypeLiteral" || variant.members.length !== 2) {
          error(`tagged union type must have { tag: "TAG", val: TYPE }`, variant);
        }
        const { key: s0, type: ty0 } = getTypeProp(variant.members[0]);
        const { key: s1, type: ty1 } = getTypeProp(variant.members[1]);
        if (s0 !== "tag" || ty0.type !== "TSLiteralType" || s1 !== "val") {
          error(`tagged union type must have { tag: "TAG", val: TYPE }`, variant);
        }
        const label = getLiteralString(ty0.literal);
        const type = convertType(ty1);
        return { label, type };
      });
      return { tag: "TaggedUnion", variants, loc: node.loc };
    }
    case "TSTypeReference": {
      const typeArgs = node.typeArguments?.params.map((tyArg) => convertType(tyArg));
      const name = getIdentifier(node.typeName);
      return { tag: "TypeVar", name, typeArgs, loc: node.loc };
    }
    default:
      error(`unknown node: ${node.type}`, node);
  }
}

function convertExpr(node: p.TSESTree.Expression, ctx: Context): Term {
  switch (node.type) {
    case "BinaryExpression": {
      if (node.operator !== "+") error(`unsupported operator: ${node.operator}`, node);
      if (node.left.type === "PrivateIdentifier") error("private identifer is not allowed", node.left);
      const left = convertExpr(node.left, ctx);
      const right = convertExpr(node.right, ctx);
      return { tag: "add", left, right, loc: node.loc };
    }
    case "Identifier":
      return { tag: "var", name: node.name, loc: node.loc };
    // deno-lint-ignore no-fallthrough
    case "Literal":
      switch (typeof node.value) {
        case "number":
          return { tag: "number", n: node.value, loc: node.loc };
        case "boolean":
          return { tag: node.value ? "true" : "false", loc: node.loc };
        default:
          error(`unsupported literal: ${node.value}`, node);
      }
    case "ArrowFunctionExpression": {
      const typeParams = node.typeParameters?.params.map((typeParameter) => typeParameter.name.name);
      const newCtx = typeParams ? addDefinedTypeVars(typeParams, ctx) : ctx;
      const params = node.params.map((param) => {
        const { name, type } = getParam(param);
        return { name, type: simplifyType(type, newCtx) };
      });
      if (node.returnType) error("return type is not required for arrow function", node.returnType);
      const body = node.body.type === "BlockStatement"
        ? convertStmts(node.body.body, true, newCtx)
        : convertExpr(node.body, newCtx);
      const func: Term = { tag: "func", params, body, loc: node.loc };
      return typeParams ? { tag: "typeAbs", typeParams, body: func, loc: node.typeParameters!.loc } : func;
    }
    case "CallExpression": {
      const args = node.arguments.map((argument) => {
        if (argument.type === "SpreadElement") error("argument must be an expression", argument);
        return convertExpr(argument, ctx);
      });
      let func = convertExpr(node.callee, ctx);
      if (node.typeArguments) {
        const typeArgs = node.typeArguments.params.map((param) => simplifyType(convertType(param), ctx));
        func = { tag: "typeApp", typeAbs: func, typeArgs, loc: node.loc };
      }
      return { tag: "call", func, args, loc: node.loc };
    }
    case "TSAsExpression":
    case "TSTypeAssertion": {
      if (node.expression.type !== "ObjectExpression") {
        error(`type assertion must be <TYPE>{ tag: "TAG", val: EXPR }`, node);
      }
      const ty = simplifyType(convertType(node.typeAnnotation), ctx);
      const { tag, val } = getTagAndVal(node.expression);
      const term = convertExpr(val, ctx);
      return { tag: "taggedUnionNew", label: tag, term, as: ty, loc: node.loc };
    }
    case "MemberExpression": {
      if (node.computed || node.property.type !== "Identifier") error("object member must be OBJ.STR", node.property);
      const obj = convertExpr(node.object, ctx);
      const propName = node.property.name;
      return { tag: "objectGet", obj, propName, loc: node.loc };
    }
    case "ObjectExpression": {
      const props = node.properties.map((property) => {
        const { key: name, value } = getProp(property);
        return { name, term: convertExpr(value, ctx) };
      });
      return { tag: "objectNew", props, loc: node.loc };
    }
    case "ConditionalExpression": {
      const cond = convertExpr(node.test, ctx);
      const thn = convertExpr(node.consequent, ctx);
      if (!node.alternate) error("else clause is requried", node);
      const els = convertExpr(node.alternate, ctx);
      return { tag: "if", cond, thn, els, loc: node.loc };
    }
    case "TSNonNullExpression":
      return convertExpr(node.expression, ctx);
    case "TSInstantiationExpression": {
      const typeArgs = node.typeArguments.params.map((param) => simplifyType(convertType(param), ctx));
      const typeAbs = convertExpr(node.expression, ctx);
      return { tag: "typeApp", typeAbs, typeArgs, loc: node.loc };
    }
    default:
      error(`unsupported expression node: ${node.type}`, node);
  }
}

function convertStmts(nodes: p.TSESTree.Statement[], requireReturn: boolean, ctx: Context): Term {
  function convertStmt(i: number, ctx: Context): Term {
    const last = nodes.length - 1 === i;
    const node = nodes[i];
    switch (node.type) {
      case "VariableDeclaration": {
        if (last && requireReturn) error("return is required", node);
        if (node.declarations.length !== 1) error("multiple variable declaration is not allowed", node);
        const decl = node.declarations[0];
        if (!decl.init) error("variable initializer is required", decl);
        const name = getIdentifier(decl.id);
        const init = convertExpr(decl.init, ctx);
        const rest: Term = last ? { tag: "var", name, loc: node.loc } : convertStmt(i + 1, ctx);
        return { tag: "const", name, init, rest, loc: node.loc };
      }
      case "ExportNamedDeclaration": {
        if (last && requireReturn) error("return is required", node);
        if (!node.declaration || node.declaration.type !== "FunctionDeclaration") {
          error("export must have a function declaration", node);
        }
        return getRecFunc(node.declaration, ctx, last ? null : () => convertStmt(i + 1, ctx));
      }
      case "FunctionDeclaration": {
        if (last && requireReturn) error("return is required", node);
        return getRecFunc(node, ctx, last ? null : () => convertStmt(i + 1, ctx));
      }
      case "ExpressionStatement": {
        if (last && requireReturn) error("return is required", node);
        const body = convertExpr(node.expression, ctx);
        return last ? body : { tag: "seq", body, rest: convertStmt(i + 1, ctx), loc: node.loc };
      }
      case "ReturnStatement": {
        if (!node.argument) error("return must have an argument", node);
        return convertExpr(node.argument, ctx);
      }
      case "IfStatement": {
        const cond = convertExpr(node.test, ctx);
        const thn = convertStmts([node.consequent], requireReturn, ctx);
        if (!node.alternate) error("else clause is requried", node);
        const els = convertStmts([node.alternate], requireReturn, ctx);
        return { tag: "if", cond, thn, els, loc: node.loc };
      }
      case "SwitchStatement": {
        const varName = getSwitchVarName(node.discriminant);
        const clauses: VariantTerm[] = [];
        node.cases.forEach((caseNode) => {
          if (!caseNode.test) error("default case is not allowed", caseNode);
          const conseq = caseNode.consequent;
          const stmts = conseq.length === 1 && conseq[0].type === "BlockStatement" ? conseq[0].body : conseq;
          const clause = convertStmts(stmts, requireReturn, ctx);
          clauses.push({ label: getLiteralString(caseNode.test), term: clause });
        });
        return { tag: "taggedUnionGet", varName, clauses, loc: node.loc };
      }
      default:
        error(`unsupported statement node: ${node.type}`, node);
    }
  }
  return convertStmt(0, ctx);
}

function convertProgram(nodes: p.TSESTree.Statement[]): Term {
  const globalTypeAliasMap: TypeAliasMap = {
    "Boolean": { typeParams: null, type: { tag: "Boolean" } },
    "Number": { typeParams: null, type: { tag: "Number" } },
  };

  const stmts = nodes.filter((node) => {
    switch (node.type) {
      case "ImportDeclaration":
        return false;
      case "TSTypeAliasDeclaration": {
        const name = node.id.name;
        const typeParams = node.typeParameters ? node.typeParameters.params.map((param) => param.name.name) : null;
        const type = convertType(node.typeAnnotation);
        globalTypeAliasMap[name] = { typeParams, type };
        return false;
      }
      default:
        return true;
    }
  });

  const ctx = { globalTypeAliasMap, typeVarBindings: {} };

  return convertStmts(stmts, false, ctx);
}

type ExtractTagsSub<T, K> = T extends Type | Term ? ExtractTags<T, K>
  : T extends Type[] ? ExtractTags<Type, K>[]
  : T extends Term[] ? ExtractTags<Term, K>[]
  : T extends (infer U)[] ? { [P in keyof U]: ExtractTags<U[P], K> }[]
  : T;
type ExtractTags<T, K> = Extract<{ [P in keyof T]: ExtractTagsSub<T[P], K> }, { tag: K }>;

function subsetSystem<Types extends Type["tag"], Terms extends Term["tag"]>(
  node: Term,
  keepTypes: Types[],
  keepTerms: Terms[],
): ExtractTags<Term, Types | Terms> {
  if (!node.tag) return node;

  if (!(<string[]> keepTypes).includes(node.tag) && !(<string[]> keepTerms).includes(node.tag)) {
    throw new Error(`"${node.tag}" is not allowed in this system`);
  }

  // deno-lint-ignore no-explicit-any
  const newNode: any = {};
  Object.entries(node).forEach(([key, val]) => {
    if (typeof val !== "object" || !val.tag) {
      newNode[key] = val;
    } else {
      newNode[key] = subsetSystem<Types, Terms>(val, keepTypes, keepTerms);
    }
  });
  return newNode;
}

export function parse(code: string): Term {
  const node = p.parse(code, { allowInvalidAST: false, loc: true });
  return convertProgram(node.body);
}

export function parseArith(code: string) {
  return subsetSystem(
    parse(code),
    ["Boolean", "Number"],
    ["true", "false", "if", "number", "add"],
  );
}

export function parseBasic(code: string) {
  return subsetSystem(
    parse(code),
    ["Boolean", "Number", "Func"],
    ["true", "false", "if", "number", "add", "var", "func", "call", "seq", "const"],
  );
}

export function parseExtended(code: string) {
  return subsetSystem(
    parse(code),
    ["Boolean", "Number", "Func", "Object", "TaggedUnion"],
    [
      "true",
      "false",
      "if",
      "number",
      "add",
      "var",
      "func",
      "call",
      "seq",
      "const",
      "objectNew",
      "objectGet",
      "taggedUnionNew",
      "taggedUnionGet",
      "recFunc",
    ],
  );
}

export function parseSub(code: string) {
  return subsetSystem(
    parse(code),
    ["Boolean", "Number", "Func", "Object"],
    ["true", "false", "number", "add", "var", "func", "call", "seq", "const", "objectNew", "objectGet"],
  );
}

export function parseRec(code: string) {
  return subsetSystem(
    parse(code),
    ["Boolean", "Number", "Func", "Rec", "TypeVar"],
    ["true", "false", "if", "number", "add", "var", "func", "call", "seq", "const"],
  );
}

export function parseRec2(code: string) {
  return subsetSystem(
    parse(code),
    ["Boolean", "Number", "Func", "Object", "TaggedUnion", "Rec", "TypeVar"],
    [
      "true",
      "false",
      "if",
      "number",
      "add",
      "var",
      "func",
      "call",
      "seq",
      "const",
      "objectNew",
      "objectGet",
      "taggedUnionNew",
      "taggedUnionGet",
      "recFunc",
    ],
  );
}

export function parsePoly(code: string) {
  return subsetSystem(
    parse(code),
    ["Boolean", "Number", "Func", "Forall", "TypeVar"],
    ["true", "false", "if", "number", "add", "var", "func", "call", "seq", "const", "typeAbs", "typeApp"],
  );
}

// deno-lint-ignore no-explicit-any
export function error(msg: string, node: any): never {
  if (node.loc) {
    const { start, end } = node.loc;
    throw new Error(`test.ts:${start.line}:${start.column + 1}-${end.line}:${end.column + 1} ${msg}`);
  } else {
    throw new Error(msg);
  }
}

// deno-lint-ignore no-explicit-any
export function generateTestUtils(typecheck: (code: any) => Type) {
  return {
    ok: (expected: string, code: string) => {
      assertEquals(expected, typeShow(typecheck(code)));
    },
    ng: (expected: string, code: string) => {
      assertThrows(() => typecheck(code), Error, expected);
    },
  };
}
