import * as p from "npm:@typescript-eslint/typescript-estree@8.21.0";

type Position = { line: number; column: number };
type Location = { start: Position; end: Position };

// Integrated node definition of types and terms.
// Not designed for type check but used to get a subset for each system.
export type Type =
  | { loc?: Location; tag: "Boolean" } // boolean
  | { loc?: Location; tag: "Number" } // number
  | { loc?: Location; tag: "String" } // string
  | { loc?: Location; tag: "Func"; params: Param[]; retType: Type } // (_: T0, ...) => T
  | { loc?: Location; tag: "Option"; elemType: Type } // elemType | undefined
  | { loc?: Location; tag: "Array"; elemType: Type } // elemType[]
  | { loc?: Location; tag: "Record"; elemType: Type } // Record<string, elemType>
  | { loc?: Location; tag: "Object"; props: PropertyType[] } // { s0: T0, ... }
  | { loc?: Location; tag: "TaggedUnion"; variants: VariantType[] } // { tag: "s0", val: T } | ...
  | { loc?: Location; tag: "Rec"; name: string; type: Type } // mu X. T
  | { loc?: Location; tag: "TypeAbs"; typeParams: string[]; type: Type } // <V0, ...>T
  | { loc?: Location; tag: "TypeVar"; name: string; typeArgs?: Type[] }
  | { loc?: Location; tag: "Undefined" }; // X

type Param = { name: string; type: Type };
type PropertyType = { name: string; type: Type };
type VariantType = { tagLabel: string; props: PropertyType[] };

type Term =
  | { loc: Location; tag: "true" }
  | { loc: Location; tag: "false" }
  | { loc: Location; tag: "not"; cond: Term }
  | { loc: Location; tag: "compare"; op: string; left: Term; right: Term }
  | { loc: Location; tag: "if"; cond: Term; thn: Term; els: Term }
  | { loc: Location; tag: "number"; n: number }
  | { loc: Location; tag: "add"; left: Term; right: Term }
  | { loc: Location; tag: "string"; s: string }
  | { loc: Location; tag: "var"; name: string }
  | { loc: Location; tag: "func"; params: Param[]; retType?: Type; body: Term }
  | { loc: Location; tag: "call"; func: Term; args: Term[] }
  | { loc: Location; tag: "seq"; body: Term; rest: Term }
  | { loc: Location; tag: "const"; name: string; init: Term; rest: Term }
  | { loc: Location; tag: "seq2"; body: Term[] }
  | { loc: Location; tag: "const2"; name: string; init: Term }
  | { loc: Location; tag: "assign"; name: string; init: Term }
  | { loc: Location; tag: "for"; ary: Term; body: Term; idx: string; rest: Term }
  | { loc: Location; tag: "forOf"; ary: Term; body: Term; var: string; rest: Term }
  | { loc: Location; tag: "arrayNew"; aryType: Type }
  | { loc: Location; tag: "arrayExt"; ary: Term; val: Term }
  | { loc: Location; tag: "recordNew"; recordType: Type }
  | { loc: Location; tag: "recordCopy"; record: Term }
  | { loc: Location; tag: "recordExt"; record: Term; key: Term; val: Term }
  | { loc: Location; tag: "recordIn"; record: Term; key: Term }
  | { loc: Location; tag: "member"; base: Term; index: Term }
  | { loc: Location; tag: "objectNew"; props: PropertyTerm[] }
  | { loc: Location; tag: "objectGet"; obj: Term; propName: string }
  | { loc: Location; tag: "taggedUnionNew"; tagLabel: string; props: PropertyTerm[]; as: Type }
  | { loc: Location; tag: "taggedUnionExt"; term: Term; as: Type }
  | { loc: Location; tag: "taggedUnionGet"; varName: string; clauses: VariantTerm[]; defaultClause: Term }
  | { loc: Location; tag: "recFunc"; funcName: string; params: Param[]; retType: Type; body: Term; rest: Term }
  | { loc: Location; tag: "typeAbs"; typeParams: string[]; body: Term }
  | { loc: Location; tag: "typeApp"; typeAbs: Term; typeArgs: Type[] }
  | { loc: Location; tag: "undefined" };

type PropertyTerm = { name: string; term: Term };
type VariantTerm = { tagLabel: string; term: Term };

// ---
// Types and terms for each system (automatically generated):
export type TypeForArith =
  | { tag: "Boolean" }
  | { tag: "Number" };

export type TermForArith =
  | { tag: "true" }
  | { tag: "false" }
  | { tag: "if"; cond: TermForArith; thn: TermForArith; els: TermForArith }
  | { tag: "number"; n: number }
  | { tag: "add"; left: TermForArith; right: TermForArith };

export type TypeForBasic =
  | { tag: "Boolean" }
  | { tag: "Number" }
  | { tag: "Func"; params: ParamForBasic[]; retType: TypeForBasic };

export type ParamForBasic = { name: string; type: TypeForBasic };

export type TermForBasic =
  | { tag: "true" }
  | { tag: "false" }
  | { tag: "if"; cond: TermForBasic; thn: TermForBasic; els: TermForBasic }
  | { tag: "number"; n: number }
  | { tag: "add"; left: TermForBasic; right: TermForBasic }
  | { tag: "var"; name: string }
  | { tag: "func"; params: ParamForBasic[]; body: TermForBasic }
  | { tag: "call"; func: TermForBasic; args: TermForBasic[] }
  | { tag: "seq"; body: TermForBasic; rest: TermForBasic }
  | { tag: "const"; name: string; init: TermForBasic; rest: TermForBasic };

export type TypeForBasic2 =
  | { tag: "Boolean" }
  | { tag: "Number" }
  | { tag: "Func"; params: ParamForBasic2[]; retType: TypeForBasic2 };

export type ParamForBasic2 = { name: string; type: TypeForBasic2 };

export type TermForBasic2 =
  | { tag: "true" }
  | { tag: "false" }
  | { tag: "if"; cond: TermForBasic2; thn: TermForBasic2; els: TermForBasic2 }
  | { tag: "number"; n: number }
  | { tag: "add"; left: TermForBasic2; right: TermForBasic2 }
  | { tag: "var"; name: string }
  | { tag: "func"; params: ParamForBasic2[]; body: TermForBasic2 }
  | { tag: "call"; func: TermForBasic2; args: TermForBasic2[] }
  | { tag: "seq2"; body: TermForBasic2[] }
  | { tag: "const2"; name: string; init: TermForBasic2 };

export type TypeForObj =
  | { tag: "Boolean" }
  | { tag: "Number" }
  | { tag: "Func"; params: ParamForObj[]; retType: TypeForObj }
  | { tag: "Object"; props: PropertyTypeForObj[] };

export type ParamForObj = { name: string; type: TypeForObj };
export type PropertyTypeForObj = { name: string; type: TypeForObj };

export type TermForObj =
  | { tag: "true" }
  | { tag: "false" }
  | { tag: "if"; cond: TermForObj; thn: TermForObj; els: TermForObj }
  | { tag: "number"; n: number }
  | { tag: "add"; left: TermForObj; right: TermForObj }
  | { tag: "var"; name: string }
  | { tag: "func"; params: ParamForObj[]; body: TermForObj }
  | { tag: "call"; func: TermForObj; args: TermForObj[] }
  | { tag: "seq"; body: TermForObj; rest: TermForObj }
  | { tag: "const"; name: string; init: TermForObj; rest: TermForObj }
  | { tag: "objectNew"; props: PropertyTermForObj[] }
  | { tag: "objectGet"; obj: TermForObj; propName: string };

export type PropertyTermForObj = { name: string; term: TermForObj };

export type TypeForTaggedUnion =
  | { tag: "Boolean" }
  | { tag: "Number" }
  | { tag: "Func"; params: ParamForTaggedUnion[]; retType: TypeForTaggedUnion }
  | { tag: "Object"; props: PropertyTypeForTaggedUnion[] }
  | { tag: "TaggedUnion"; variants: VariantTypeForTaggedUnion[] };

export type ParamForTaggedUnion = { name: string; type: TypeForTaggedUnion };
export type PropertyTypeForTaggedUnion = { name: string; type: TypeForTaggedUnion };
export type VariantTypeForTaggedUnion = { tagLabel: string; props: PropertyTypeForTaggedUnion[] };

export type TermForTaggedUnion =
  | { tag: "true" }
  | { tag: "false" }
  | { tag: "if"; cond: TermForTaggedUnion; thn: TermForTaggedUnion; els: TermForTaggedUnion }
  | { tag: "number"; n: number }
  | { tag: "add"; left: TermForTaggedUnion; right: TermForTaggedUnion }
  | { tag: "var"; name: string }
  | { tag: "func"; params: ParamForTaggedUnion[]; body: TermForTaggedUnion }
  | { tag: "call"; func: TermForTaggedUnion; args: TermForTaggedUnion[] }
  | { tag: "seq"; body: TermForTaggedUnion; rest: TermForTaggedUnion }
  | { tag: "const"; name: string; init: TermForTaggedUnion; rest: TermForTaggedUnion }
  | { tag: "objectNew"; props: PropertyTermForTaggedUnion[] }
  | { tag: "objectGet"; obj: TermForTaggedUnion; propName: string }
  | { tag: "taggedUnionNew"; tagLabel: string; props: PropertyTermForTaggedUnion[]; as: TypeForTaggedUnion }
  | { tag: "taggedUnionGet"; varName: string; clauses: VariantTermForTaggedUnion[] };

export type PropertyTermForTaggedUnion = { name: string; term: TermForTaggedUnion };
export type VariantTermForTaggedUnion = { tagLabel: string; term: TermForTaggedUnion };

export type TypeForRecFunc =
  | { tag: "Boolean" }
  | { tag: "Number" }
  | { tag: "Func"; params: ParamForRecFunc[]; retType: TypeForRecFunc };

export type ParamForRecFunc = { name: string; type: TypeForRecFunc };

export type TermForRecFunc =
  | { tag: "true" }
  | { tag: "false" }
  | { tag: "if"; cond: TermForRecFunc; thn: TermForRecFunc; els: TermForRecFunc }
  | { tag: "number"; n: number }
  | { tag: "add"; left: TermForRecFunc; right: TermForRecFunc }
  | { tag: "var"; name: string }
  | { tag: "func"; params: ParamForRecFunc[]; body: TermForRecFunc }
  | { tag: "call"; func: TermForRecFunc; args: TermForRecFunc[] }
  | { tag: "seq"; body: TermForRecFunc; rest: TermForRecFunc }
  | { tag: "const"; name: string; init: TermForRecFunc; rest: TermForRecFunc }
  | {
    tag: "recFunc";
    funcName: string;
    params: ParamForRecFunc[];
    retType: TypeForRecFunc;
    body: TermForRecFunc;
    rest: TermForRecFunc;
  };

export type TypeForSub =
  | { tag: "Boolean" }
  | { tag: "Number" }
  | { tag: "Func"; params: ParamForSub[]; retType: TypeForSub }
  | { tag: "Object"; props: PropertyTypeForSub[] };

export type ParamForSub = { name: string; type: TypeForSub };
export type PropertyTypeForSub = { name: string; type: TypeForSub };

export type TermForSub =
  | { tag: "true" }
  | { tag: "false" }
  //| { tag: "if"; cond: TermForSub; thn: TermForSub; els: TermForSub }
  | { tag: "number"; n: number }
  | { tag: "add"; left: TermForSub; right: TermForSub }
  | { tag: "var"; name: string }
  | { tag: "func"; params: ParamForSub[]; body: TermForSub }
  | { tag: "call"; func: TermForSub; args: TermForSub[] }
  | { tag: "seq"; body: TermForSub; rest: TermForSub }
  | { tag: "const"; name: string; init: TermForSub; rest: TermForSub }
  | { tag: "objectNew"; props: PropertyTermForSub[] }
  | { tag: "objectGet"; obj: TermForSub; propName: string };

export type PropertyTermForSub = { name: string; term: TermForSub };

export type TypeForRec =
  | { tag: "Boolean" }
  | { tag: "Number" }
  | { tag: "Func"; params: ParamForRec[]; retType: TypeForRec }
  | { tag: "Object"; props: PropertyTypeForRec[] }
  | { tag: "Rec"; name: string; type: TypeForRec }
  | { tag: "TypeVar"; name: string };

export type ParamForRec = { name: string; type: TypeForRec };
export type PropertyTypeForRec = { name: string; type: TypeForRec };

export type TermForRec =
  | { tag: "true" }
  | { tag: "false" }
  | { tag: "if"; cond: TermForRec; thn: TermForRec; els: TermForRec }
  | { tag: "number"; n: number }
  | { tag: "add"; left: TermForRec; right: TermForRec }
  | { tag: "var"; name: string }
  | { tag: "func"; params: ParamForRec[]; body: TermForRec }
  | { tag: "call"; func: TermForRec; args: TermForRec[] }
  | { tag: "seq"; body: TermForRec; rest: TermForRec }
  | { tag: "const"; name: string; init: TermForRec; rest: TermForRec }
  | { tag: "objectNew"; props: PropertyTermForRec[] }
  | { tag: "objectGet"; obj: TermForRec; propName: string }
  | {
    tag: "recFunc";
    funcName: string;
    params: ParamForRec[];
    retType: TypeForRec;
    body: TermForRec;
    rest: TermForRec;
  };

export type PropertyTermForRec = { name: string; term: TermForRec };

export type TypeForRec2 =
  | { tag: "Boolean" }
  | { tag: "Number" }
  | { tag: "Func"; params: ParamForRec2[]; retType: TypeForRec2 }
  | { tag: "Object"; props: PropertyTypeForRec2[] }
  | { tag: "TaggedUnion"; variants: VariantTypeForRec2[] }
  | { tag: "Rec"; name: string; type: TypeForRec2 }
  | { tag: "TypeVar"; name: string };

export type ParamForRec2 = { name: string; type: TypeForRec2 };
export type PropertyTypeForRec2 = { name: string; type: TypeForRec2 };
export type VariantTypeForRec2 = { tagLabel: string; props: PropertyTypeForRec2[] };

export type TermForRec2 =
  | { tag: "true" }
  | { tag: "false" }
  | { tag: "if"; cond: TermForRec2; thn: TermForRec2; els: TermForRec2 }
  | { tag: "number"; n: number }
  | { tag: "add"; left: TermForRec2; right: TermForRec2 }
  | { tag: "var"; name: string }
  | { tag: "func"; params: ParamForRec2[]; body: TermForRec2 }
  | { tag: "call"; func: TermForRec2; args: TermForRec2[] }
  | { tag: "seq"; body: TermForRec2; rest: TermForRec2 }
  | { tag: "const"; name: string; init: TermForRec2; rest: TermForRec2 }
  | { tag: "objectNew"; props: PropertyTermForRec2[] }
  | { tag: "objectGet"; obj: TermForRec2; propName: string }
  | { tag: "taggedUnionNew"; tagLabel: string; props: PropertyTermForRec2[]; as: TypeForRec2 }
  | { tag: "taggedUnionGet"; varName: string; clauses: VariantTermForRec2[] }
  | {
    tag: "recFunc";
    funcName: string;
    params: ParamForRec2[];
    retType: TypeForRec2;
    body: TermForRec2;
    rest: TermForRec2;
  };

export type PropertyTermForRec2 = { name: string; term: TermForRec2 };
export type VariantTermForRec2 = { tagLabel: string; term: TermForRec2 };

export type TypeForPoly =
  | { tag: "Boolean" }
  | { tag: "Number" }
  | { tag: "Func"; params: ParamForPoly[]; retType: TypeForPoly }
  | { tag: "TypeAbs"; typeParams: string[]; type: TypeForPoly }
  | { tag: "TypeVar"; name: string };

export type ParamForPoly = { name: string; type: TypeForPoly };

export type TermForPoly =
  | { tag: "true" }
  | { tag: "false" }
  | { tag: "if"; cond: TermForPoly; thn: TermForPoly; els: TermForPoly }
  | { tag: "number"; n: number }
  | { tag: "add"; left: TermForPoly; right: TermForPoly }
  | { tag: "var"; name: string }
  | { tag: "func"; params: ParamForPoly[]; body: TermForPoly }
  | { tag: "call"; func: TermForPoly; args: TermForPoly[] }
  | { tag: "seq"; body: TermForPoly; rest: TermForPoly }
  | { tag: "const"; name: string; init: TermForPoly; rest: TermForPoly }
  | { tag: "typeAbs"; typeParams: string[]; body: TermForPoly }
  | { tag: "typeApp"; typeAbs: TermForPoly; typeArgs: TypeForPoly[] };
// End of automatically generated code

type TypeForSelf =
  | { tag: "Boolean" }
  | { tag: "Number" }
  | { tag: "String" }
  | { tag: "Option"; elemType: TypeForSelf }
  | { tag: "Array"; elemType: TypeForSelf }
  | { tag: "Record"; elemType: TypeForSelf }
  | { tag: "Func"; params: ParamForSelf[]; retType: TypeForSelf }
  | { tag: "Object"; props: PropertyTypeForSelf[] }
  | { tag: "TaggedUnion"; variants: VariantTypeForSelf[] }
  | { tag: "Rec"; name: string; type: TypeForSelf }
  | { tag: "TypeVar"; name: string }
  | { tag: "Undefined" };

type ParamForSelf = { name: string; type: TypeForSelf };
type PropertyTypeForSelf = { name: string; type: TypeForSelf };
type VariantTypeForSelf = { tagLabel: string; props: PropertyTypeForSelf[] };

type TermForSelf =
  | { tag: "true" }
  | { tag: "false" }
  | { tag: "not"; cond: TermForSelf }
  | { tag: "compare"; op: string; left: TermForSelf; right: TermForSelf }
  | { tag: "if"; cond: TermForSelf; thn: TermForSelf; els: TermForSelf }
  | { tag: "number"; n: number }
  | { tag: "add"; left: TermForSelf; right: TermForSelf }
  | { tag: "string"; s: string }
  | { tag: "var"; name: string }
  | { tag: "func"; params: ParamForSelf[]; body: TermForSelf }
  | { tag: "call"; func: TermForSelf; args: TermForSelf[] }
  | { tag: "seq"; body: TermForSelf; rest: TermForSelf }
  | { tag: "const"; name: string; init: TermForSelf; rest: TermForSelf }
  | { tag: "assign"; name: string; init: TermForSelf }
  | { tag: "for"; ary: TermForSelf; body: TermForSelf; idx: string; rest: TermForSelf }
  | { tag: "forOf"; ary: TermForSelf; body: TermForSelf; var: string; rest: TermForSelf }
  | { tag: "arrayNew"; aryType: TypeForSelf }
  | { tag: "arrayExt"; ary: TermForSelf; val: TermForSelf }
  | { tag: "recordNew"; recordType: TypeForSelf }
  | { tag: "recordCopy"; record: TermForSelf }
  | { tag: "recordExt"; record: TermForSelf; key: TermForSelf; val: TermForSelf }
  | { tag: "recordIn"; record: TermForSelf; key: TermForSelf }
  | { tag: "member"; base: TermForSelf; index: TermForSelf }
  | { tag: "objectNew"; props: PropertyTermForSelf[] }
  | { tag: "objectGet"; obj: TermForSelf; propName: string }
  | { tag: "taggedUnionNew"; tagLabel: string; props: PropertyTermForSelf[]; as: TypeForSelf }
  | { tag: "taggedUnionExt"; term: TermForSelf; as: TypeForSelf }
  | { tag: "taggedUnionGet"; varName: string; clauses: VariantTermForSelf[]; defaultClause: TermForSelf }
  | {
    tag: "recFunc";
    funcName: string;
    params: ParamForSelf[];
    retType: TypeForSelf;
    body: TermForSelf;
    rest: TermForSelf;
  }
  | { tag: "undefined" };

type PropertyTermForSelf = { name: string; term: TermForSelf };
type VariantTermForSelf = { tagLabel: string; term: TermForSelf };

// ---
// Preprocessing of type variables.
// Replace type aliases with their definitions.
// If recursive, convert it to a recursive type.

type TypeAliasMap = Record<string, { typeParams: string[] | null; type: Type }>;
type TypeVarBindings = Record<string, Type>;
type Context = {
  globalTypeAliasMap: TypeAliasMap;
  typeVarBindings: TypeVarBindings;
};

// Get all free type variables in a type
function freeTypeVars(ty: Type): Set<string> {
  switch (ty.tag) {
    case "Boolean":
    case "Number":
    case "String":
      return new Set();
    case "Option":
      return freeTypeVars(ty.elemType);
    case "Array":
      return freeTypeVars(ty.elemType);
    case "Record":
      return freeTypeVars(ty.elemType);
    case "Func":
      return ty.params.reduce((r, { type }) => r.union(freeTypeVars(type)), freeTypeVars(ty.retType));
    case "Object":
      return ty.props.reduce((r, { type }) => r.union(freeTypeVars(type)), new Set<string>());
    case "TaggedUnion":
      return ty.variants.reduce((r, { props }) => {
        return props.reduce((r, { type }) => r.union(freeTypeVars(type)), r);
      }, new Set<string>());
    case "Rec":
      return freeTypeVars(ty.type).difference(new Set([ty.name]));
    case "TypeAbs":
      return freeTypeVars(ty.type).difference(new Set(ty.typeParams));
    case "TypeVar":
      return new Set([ty.name]);
    case "Undefined":
      return new Set();
  }
}

// Add type variables to the context
function extendContextWithTypeVars(ctx: Context, tyVars: string[]): Context {
  return {
    globalTypeAliasMap: ctx.globalTypeAliasMap,
    typeVarBindings: tyVars.reduce(
      (bindings, name) => ({ ...bindings, [name]: { tag: "TypeVar", name } }),
      ctx.typeVarBindings,
    ),
  };
}

// Expand type variables in a type
function expandTypeAliases(ty: Type, recDefined: Set<string>, ctx: Context): Type {
  switch (ty.tag) {
    case "Boolean":
      return { tag: "Boolean" };
    case "Number":
      return { tag: "Number" };
    case "String":
      return { tag: "String" };
    case "Option":
      return { tag: "Option", elemType: expandTypeAliases(ty.elemType, recDefined, ctx) };
    case "Array":
      return { tag: "Array", elemType: expandTypeAliases(ty.elemType, recDefined, ctx) };
    case "Record":
      return { tag: "Record", elemType: expandTypeAliases(ty.elemType, recDefined, ctx) };
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
      const variants = ty.variants.map(({ tagLabel, props }) => ({
        tagLabel,
        props: props.map(({ name, type }) => ({ name, type: expandTypeAliases(type, recDefined, ctx) })),
      }));
      return { tag: "TaggedUnion", variants };
    }
    case "Rec": {
      const newCtx = extendContextWithTypeVars(ctx, [ty.name]);
      return { tag: "Rec", name: ty.name, type: expandTypeAliases(ty.type, recDefined, newCtx) };
    }
    case "TypeAbs": {
      const newCtx = extendContextWithTypeVars(ctx, ty.typeParams);
      return { tag: "TypeAbs", typeParams: ty.typeParams, type: expandTypeAliases(ty.type, recDefined, newCtx) };
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
        if (freeTypeVars(retTy).has(ty.name)) error("bug?", ty);
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
        return freeTypeVars(retTy).has(ty.name) ? { tag: "Rec", name: ty.name, type: retTy } : retTy;
      }
    }
    case "Undefined":
      return { tag: "Undefined" };
  }
}

// Replace type variables in a type
function simplifyType(ty: Type, ctx: Context) {
  return expandTypeAliases(ty, new Set(), ctx);
}

// ---
// Convert estree nodes to our simplified node definition

// Helper functions to get properties of estree nodes

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

function getTagAndProps(node: p.TSESTree.ObjectExpression) {
  const props = node.properties.map(getProp);
  const tag = props.find(({ key }) => key == "tag");
  if (!tag) error(`tagged union must have a "tag" key`, node);
  const props2 = props.filter(({ key }) => key != "tag");

  return { tag: getLiteralString(tag.value), props: props2 };
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

// Convert estree type node to our simplified node definition
function convertType(node: p.TSESTree.TypeNode): Type {
  switch (node.type) {
    case "TSBooleanKeyword":
      return { tag: "Boolean", loc: node.loc };
    case "TSNumberKeyword":
      return { tag: "Number", loc: node.loc };
    case "TSStringKeyword":
      return { tag: "String", loc: node.loc };
    case "TSArrayType": {
      return { tag: "Array", elemType: convertType(node.elementType), loc: node.loc };
    }
    case "TSFunctionType": {
      if (!node.returnType) error("return type is required", node);
      const params = node.params.map((param) => getParam(param));
      const retType = convertType(node.returnType.typeAnnotation);
      const funcTy: Type = { tag: "Func", params, retType };
      if (!node.typeParameters) return funcTy;
      const typeParams = node.typeParameters.params.map((typeParameter) => typeParameter.name.name);
      if (new Set(typeParams).size !== typeParams.length) error("duplicate type parameters", node);
      return { tag: "TypeAbs", typeParams, type: funcTy, loc: node.loc };
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
        if (variant.type !== "TSTypeLiteral") {
          error(`tagged union type must be { tag: "TAG", ... }`, variant);
        }
        const variant2 = variant.members.map(getTypeProp);
        const found = variant2.find(({ key }) => key === "tag");
        if (!found) {
          error(`tagged union type must be { tag: "TAG", ... }`, variant);
        }
        const { type: tagType } = found;
        if (tagType.type !== "TSLiteralType") {
          error(`tagged union type must be { tag: "TAG", ... }`, variant);
        }
        const tagLabel = getLiteralString(tagType.literal);
        const variant3 = variant2.filter(({ key }) => key !== "tag");
        const props = variant3.map(({ key, type }) => ({ name: key, type: convertType(type) }));
        return { tagLabel, props };
      });
      return { tag: "TaggedUnion", variants, loc: node.loc };
    }
    case "TSTypeReference": {
      const typeArgs = node.typeArguments?.params.map((tyArg) => convertType(tyArg));
      const name = getIdentifier(node.typeName);
      if (name === "Record") {
        if (!typeArgs || typeArgs.length !== 2) error("Record must have 2 type arguments", node);
        if (typeArgs[0].tag !== "String") error("Record must be Record<string, type>", node);
        return { tag: "Record", elemType: typeArgs[1], loc: node.loc };
      }
      return { tag: "TypeVar", name, typeArgs, loc: node.loc };
    }
    default:
      error(`unknown node: ${node.type}`, node);
  }
}

function newIfNode(cond: Term, thn: Term, els: Term, loc: Location): Term {
  if (cond.tag === "compare") {
    if (cond.left.tag === "objectGet" && cond.left.obj.tag === "var" && cond.left.propName == "tag") {
      if (cond.right.tag === "string") {
        const varName = cond.left.obj.name;
        const tagLabel = cond.right.s;
        if (cond.op === "===") {
          return { tag: "taggedUnionGet", varName, clauses: [{ tagLabel, term: thn }], defaultClause: els, loc };
        } else if (cond.op === "!==") {
          return { tag: "taggedUnionGet", varName, clauses: [{ tagLabel, term: els }], defaultClause: thn, loc };
        }
      }
    }
  }
  return { tag: "if", cond, thn, els, loc };
}

// Convert estree expression node to our simplified node definition
function convertExpr(node: p.TSESTree.Expression, ctx: Context): Term {
  switch (node.type) {
    case "UnaryExpression": {
      if (node.operator !== "!") error(`unsupported operator: ${node.operator}`, node);
      const body = convertExpr(node.argument, ctx);
      return { tag: "not", cond: body, loc: node.loc };
    }
    // deno-lint-ignore no-fallthrough
    case "BinaryExpression": {
      if (node.left.type === "PrivateIdentifier") error("private identifer is not allowed", node.left);
      switch (node.operator) {
        case "+": {
          const left = convertExpr(node.left, ctx);
          const right = convertExpr(node.right, ctx);
          return { tag: "add", left, right, loc: node.loc };
        }
        case "===":
        case "!==": {
          const left = convertExpr(node.left, ctx);
          const right = convertExpr(node.right, ctx);
          return { tag: "compare", op: node.operator, left, right, loc: node.loc };
        }
        case "in": {
          const key = convertExpr(node.left, ctx);
          const record = convertExpr(node.right, ctx);
          return { tag: "recordIn", record, key, loc: node.loc };
        }
        default:
          error(`unsupported operator: ${node.operator}`, node);
      }
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
        case "string":
          return { tag: "string", s: node.value, loc: node.loc };
        default:
          error(`unsupported literal: ${node.value}`, node);
      }
    case "ArrowFunctionExpression": {
      const typeParams = node.typeParameters?.params.map((typeParameter) => typeParameter.name.name);
      const newCtx = typeParams ? extendContextWithTypeVars(ctx, typeParams) : ctx;
      const params = node.params.map((param) => {
        const { name, type } = getParam(param);
        return { name, type: simplifyType(type, newCtx) };
      });
      let retType;
      if (node.returnType) {
        retType = simplifyType(convertType(node.returnType.typeAnnotation), ctx);
      }
      const body = node.body.type === "BlockStatement"
        ? convertStmts(node.body.body, true, newCtx)
        : convertExpr(node.body, newCtx);
      const func: Term = { tag: "func", params, ...(retType !== undefined ? { retType } : {}), body, loc: node.loc };
      if (typeParams && new Set(typeParams).size !== typeParams.length) error("duplicate type parameters", node);
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
    case "TSSatisfiesExpression":
    case "TSTypeAssertion": {
      switch (node.expression.type) {
        case "ObjectExpression": {
          const ty = simplifyType(convertType(node.typeAnnotation), ctx);
          if (node.expression.properties.length === 0) {
            return { tag: "recordNew", recordType: ty, loc: node.loc };
          }
          const { tag, props } = getTagAndProps(node.expression);
          const props2: PropertyTerm[] = [];
          props.forEach(({ key, value }) => {
            props2.push({ name: key, term: convertExpr(value, ctx) });
          });
          return { tag: "taggedUnionNew", tagLabel: tag, props: props2, as: ty, loc: node.loc };
        }
        case "ArrayExpression": {
          const ty = simplifyType(convertType(node.typeAnnotation), ctx);
          if (node.expression.elements.length !== 0) {
            error("type-asserted array literal must be empty", node.expression.elements);
          }
          return { tag: "arrayNew", aryType: ty, loc: node.loc };
        }
        default: {
          const ty = simplifyType(convertType(node.typeAnnotation), ctx);
          const term = convertExpr(node.expression, ctx);
          return { tag: "taggedUnionExt", term, as: ty, loc: node.loc };
        }
      }
    }
    case "MemberExpression": {
      if (node.computed) {
        const base = convertExpr(node.object, ctx);
        const index = convertExpr(node.property, ctx);
        return { tag: "member", base, index, loc: node.loc };
      }
      if (node.property.type !== "Identifier") error("object member must be OBJ.STR", node.property);
      const obj = convertExpr(node.object, ctx);
      const propName = node.property.name;
      return { tag: "objectGet", obj, propName, loc: node.loc };
    }
    case "ArrayExpression": {
      if (node.elements.length !== 2 || !node.elements[0] || node.elements[0].type !== "SpreadElement") {
        error(`array must be "[...ary, val]"`, node);
      }
      if (!node.elements[1] || node.elements[1].type === "SpreadElement") {
        error(`array must be "[...ary, val]"`, node);
      }
      const base = convertExpr(node.elements[0].argument, ctx);
      const val = convertExpr(node.elements[1], ctx);
      return { tag: "arrayExt", ary: base, val, loc: node.loc };
    }
    case "ObjectExpression": {
      if (node.properties.length === 0) error("bare empty object is not allowed", node);
      if (node.properties.length <= 2) {
        if (node.properties[0].type === "SpreadElement") {
          const record = convertExpr(node.properties[0].argument, ctx);
          if (node.properties.length === 1) {
            return { tag: "recordCopy", record, loc: node.loc };
          }
          if (node.properties[1].type !== "SpreadElement") {
            const property = node.properties[1];
            if (!property.computed) error(`record extension must be "{ ...record, [key]: value }"`, property);
            const key = convertExpr(property.key, ctx);
            if (property.value.type === "AssignmentPattern") error("AssignmentPattern is not allowed", property);
            if (property.value.type === "TSEmptyBodyFunctionExpression") {
              error("TSEmptyBodyFunctionExpression is not allowed", property);
            }
            const val = convertExpr(property.value, ctx);
            return { tag: "recordExt", record, key, val, loc: node.loc };
          }
        }
      }
      const props = node.properties.map((property) => {
        const { key: name, value } = getProp(property);
        return { name, term: convertExpr(value, ctx) };
      });
      return { tag: "objectNew", props, loc: node.loc };
    }
    case "AssignmentExpression": {
      if (node.operator !== "=") error(`unsupported operator: ${node.operator}`, node);
      const varName = getIdentifier(node.left);
      const init = convertExpr(node.right, ctx);
      return { tag: "assign", name: varName, init, loc: node.loc };
    }
    case "ConditionalExpression": {
      const cond = convertExpr(node.test, ctx);
      const thn = convertExpr(node.consequent, ctx);
      if (!node.alternate) error("else clause is requried", node);
      const els = convertExpr(node.alternate, ctx);
      return newIfNode(cond, thn, els, node.loc);
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

// Convert estree statement nodes to our simplified node definition
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
        if (
          node.expression.type === "CallExpression" && node.expression.callee.type === "Identifier" &&
          node.expression.callee.name === "error"
        ) {
          return { tag: "undefined", loc: node.loc };
        }
        const body = convertExpr(node.expression, ctx);
        if (last && !requireReturn) return body;
        const rest: Term = last ? { tag: "undefined", loc: node.loc } : convertStmt(i + 1, ctx);
        return { tag: "seq", body, rest, loc: node.loc };
      }
      case "ReturnStatement": {
        if (!node.argument) error("return must have an argument", node);
        return convertExpr(node.argument, ctx);
      }
      case "IfStatement": {
        const cond = convertExpr(node.test, ctx);
        const thn = node.consequent.type == "BlockStatement"
          ? convertStmts(node.consequent.body, requireReturn, ctx)
          : convertStmts([node.consequent], requireReturn, ctx);
        let els: Term;
        if (!node.alternate) {
          if (!requireReturn) error("else clause is requried", node);
          els = nodes[i + 1] ? convertStmt(i + 1, ctx) : { tag: "undefined", loc: node.loc };
        } else {
          els = convertStmts(
            node.alternate.type == "BlockStatement" ? node.alternate.body : [node.alternate],
            requireReturn,
            ctx,
          );
        }
        return newIfNode(cond, thn, els, node.loc);
      }
      case "ForOfStatement": {
        if (!requireReturn) error("for statement is not allowed", node);
        if (node.left.type !== "VariableDeclaration") error(`for statement must be "for (let i of ary)"`, node);
        const varName = getIdentifier(node.left.declarations[0].id);
        const ary = convertExpr(node.right, ctx);
        if (node.body.type !== "BlockStatement") {
          error(`for statement must be "for (let i of ary)"`, node);
        }
        const body = convertStmts(node.body.body, true, ctx);
        const rest: Term = nodes[i + 1] ? convertStmt(i + 1, ctx) : { tag: "undefined", loc: node.loc };
        return { tag: "forOf", ary, var: varName, body, rest, loc: node.loc };
      }
      case "ForStatement": {
        if (!requireReturn) error("for statement is not allowed", node);
        if (!node.init || node.init.type !== "VariableDeclaration") {
          error(`for statement must be "for (let i = 0; i < ary.length; i++)"`, node);
        }
        const inits = node.init;
        if (inits.declarations.length !== 1) {
          error(`for statement must be "for (let i = 0; i < ary.length; i++)"`, node);
        }
        const idxVarName = getIdentifier(inits.declarations[0].id);
        const init = inits.declarations[0].init;
        if (!init || init.type !== "Literal" || init.value !== 0) {
          error(`for statement must be "for (let i = 0; i < ary.length; i++)"`, node);
        }
        if (!node.test || node.test.type !== "BinaryExpression" || node.test.operator !== "<") {
          error(`for statement must be "for (let i = 0; i < ary.length; i++)"`, node);
        }
        const testLeft = node.test.left;
        if (testLeft.type !== "Identifier" || testLeft.name !== idxVarName) {
          error(`for statement must be "for (let i = 0; i < ary.length; i++)"`, node);
        }
        const testRight = node.test.right;
        if (
          testRight.type !== "MemberExpression" || testRight.computed || testRight.property.type !== "Identifier" ||
          testRight.property.name !== "length"
        ) {
          error(`for statement must be "for (let i = 0; i < ary.length; i++)"`, node);
        }
        const ary = convertExpr(testRight.object, ctx);
        if (!node.update || node.update.type !== "UpdateExpression" || node.update.operator !== "++") {
          error(`for statement must be "for (let i = 0; i < ary.length; i++)"`, node);
        }
        if (node.update.argument.type !== "Identifier" || node.update.argument.name !== idxVarName) {
          error(`for statement must be "for (let i = 0; i < ary.length; i++)"`, node);
        }
        if (node.body.type !== "BlockStatement") {
          error(`for statement must be "for (let i = 0; i < ary.length; i++)"`, node);
        }
        const body = convertStmts(node.body.body, true, ctx);
        const rest: Term = nodes[i + 1] ? convertStmt(i + 1, ctx) : { tag: "undefined", loc: node.loc };
        return { tag: "for", ary, idx: idxVarName, body, rest, loc: node.loc };
      }
      case "SwitchStatement": {
        const varName = getSwitchVarName(node.discriminant);
        const clauses: VariantTerm[] = [];
        let defaultClause: Term = { tag: "undefined", loc: node.loc };
        node.cases.forEach((caseNode) => {
          const conseq = caseNode.consequent;
          const stmts = conseq.length === 1 && conseq[0].type === "BlockStatement" ? conseq[0].body : conseq;
          const clause = convertStmts(stmts, requireReturn, ctx);
          if (caseNode.test) {
            clauses.push({ tagLabel: getLiteralString(caseNode.test), term: clause });
          } else {
            defaultClause = clause;
          }
        });
        return { tag: "taggedUnionGet", varName, clauses, defaultClause, loc: node.loc };
      }
      case "ThrowStatement": {
        return { tag: "undefined", loc: node.loc };
      }
      case "EmptyStatement": {
        return convertStmt(i + 1, ctx);
      }
      default:
        error(`unsupported statement node: ${node.type}`, node);
    }
  }
  return convertStmt(0, ctx);
}

// Convert estree program nodes to our simplified node definition
function convertProgram(nodes: p.TSESTree.Statement[]): Term {
  const globalTypeAliasMap: TypeAliasMap = {};

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

// ---
// Parse functions

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
  keepDefaultClause: boolean = false,
): ExtractTags<Term, Types | Terms> {
  // deno-lint-ignore no-explicit-any
  if (!node.tag) return node as any;

  if (!(keepTypes as string[]).includes(node.tag) && !(keepTerms as string[]).includes(node.tag)) {
    throw new Error(`"${node.tag}" is not allowed in this system`);
  }

  // deno-lint-ignore no-explicit-any
  const newNode: any = {};
  Object.entries(node).forEach(([key, val]) => {
    if (!keepDefaultClause && key === "defaultClause") return;
    if (typeof val !== "object" || !val.tag) {
      newNode[key] = val;
    } else {
      newNode[key] = subsetSystem<Types, Terms>(val, keepTypes, keepTerms, keepDefaultClause);
    }
  });
  return newNode;
}

export function parse(code: string): Term {
  const node = p.parse(code, { allowInvalidAST: false, loc: true });
  return convertProgram(node.body);
}

export function parseArith(code: string): TermForArith {
  return subsetSystem(
    parse(code),
    ["Boolean", "Number"],
    ["true", "false", "if", "number", "add"],
  );
}

export function parseBasic(code: string): TermForBasic {
  return subsetSystem(
    parse(code),
    ["Boolean", "Number", "Func"],
    ["true", "false", "if", "number", "add", "var", "func", "call", "seq", "const"],
  );
}

export function parseBasic2(code: string): TermForBasic2 {
  function conv(node: Term): Term {
    switch (node.tag) {
      case "if":
        return { tag: "if", cond: conv(node.cond), thn: conv(node.thn), els: conv(node.els), loc: node.loc };
      case "add":
        return { tag: "add", left: conv(node.left), right: conv(node.right), loc: node.loc };
      case "func":
        return { tag: "func", params: node.params, body: conv(node.body), loc: node.loc };
      case "call":
        return { tag: "call", func: conv(node.func), args: node.args.map(conv), loc: node.loc };
      case "seq":
      case "const": {
        const body: Term[] = [];
        while (true) {
          switch (node.tag) {
            case "seq": {
              body.push(conv(node.body));
              node = node.rest;
              break;
            }
            case "const": {
              body.push({ tag: "const2", name: node.name, init: conv(node.init), loc: node.loc });
              node = node.rest;
              break;
            }
            default: {
              body.push(conv(node));
              return { tag: "seq2", body, loc: node.loc };
            }
          }
        }
      }
      default:
        return node;
    }
  }
  return subsetSystem(
    conv(parse(code)),
    ["Boolean", "Number", "Func"],
    ["true", "false", "if", "number", "add", "var", "func", "call", "seq2", "const2"],
  );
}

export function parseObj(code: string): TermForObj {
  return subsetSystem(
    parse(code),
    ["Boolean", "Number", "Func", "Object"],
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
    ],
  );
}

export function parseTaggedUnion(code: string): TermForTaggedUnion {
  return subsetSystem(
    parse(code),
    ["Boolean", "Number", "Func", "TaggedUnion"],
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
      "taggedUnionNew",
      "taggedUnionGet",
    ],
  );
}

export function parseRecFunc(code: string): TermForRecFunc {
  return subsetSystem(
    parse(code),
    ["Boolean", "Number", "Func"],
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
      "recFunc",
    ],
  );
}

export function parseSub(code: string): TermForSub {
  return subsetSystem(
    parse(code),
    ["Boolean", "Number", "Func", "Object"],
    ["true", "false", "number", "add", "var", "func", "call", "seq", "const", "objectNew", "objectGet"],
  );
}

export function parseRec(code: string): TermForRec {
  return subsetSystem(
    parse(code),
    ["Boolean", "Number", "Func", "Object", "Rec", "TypeVar"],
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
      "recFunc",
    ],
  );
}

export function parseRec2(code: string): TermForRec2 {
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

export function parsePoly(code: string): TermForPoly {
  return subsetSystem(
    parse(code),
    ["Boolean", "Number", "Func", "TypeAbs", "TypeVar"],
    ["true", "false", "if", "number", "add", "var", "func", "call", "seq", "const", "typeAbs", "typeApp"],
  );
}

export function parseSelf(code: string): TermForSelf {
  return subsetSystem(
    parse(code),
    ["Boolean", "Number", "String", "Option", "Array", "Record", "Func", "Object", "TaggedUnion", "Rec", "TypeVar"],
    [
      "true",
      "false",
      "not",
      "compare",
      "if",
      "number",
      "add",
      "string",
      "var",
      "func",
      "call",
      "seq",
      "const",
      "assign",
      "for",
      "forOf",
      "arrayNew",
      "arrayExt",
      "recordNew",
      "recordCopy",
      "recordExt",
      "recordIn",
      "member",
      "objectNew",
      "objectGet",
      "taggedUnionNew",
      "taggedUnionExt",
      "taggedUnionGet",
      "recFunc",
      "undefined",
    ],
    true,
  );
}

// ---
// Helper functions

// deno-lint-ignore no-explicit-any
export function error(msg: string, node: any): never {
  if (node.loc) {
    const { start, end } = node.loc;
    throw new Error(`test.ts:${start.line}:${start.column + 1}-${end.line}:${end.column + 1} ${msg}`);
  } else {
    throw new Error(msg);
  }
}

// Returns a string that represents a given type
export function typeShow(ty: Type): string {
  switch (ty.tag) {
    case "Boolean":
      return "boolean";
    case "Number":
      return "number";
    case "String":
      return "string";
    case "Option":
      return `(${typeShow(ty.elemType)} | undefined)`;
    case "Array": {
      if (ty.elemType.tag === "Func") {
        return `(${typeShow(ty.elemType)})[]`;
      }
      return `${typeShow(ty.elemType)}[]`;
    }
    case "Record": {
      return `Record<string, ${typeShow(ty.elemType)}>`;
    }
    case "Func": {
      const params = ty.params.map(({ name, type }) => `${name}: ${typeShow(type)}`);
      return `(${params.join(", ")}) => ${typeShow(ty.retType)}`;
    }
    case "Object": {
      const props = ty.props.map(({ name, type }) => `${name}: ${typeShow(type)}`);
      return `{ ${props.join("; ")} }`;
    }
    case "TaggedUnion": {
      const variants = ty.variants.map(({ tagLabel, props }) => {
        const propsStr = [`tag: "${tagLabel}"`, ...props.map(({ name, type }) => `${name}: ${typeShow(type)}`)];
        return `{ ${propsStr.join("; ")} }`;
      });
      return `(${variants.join(" | ")})`;
    }
    case "Rec":
      return `(mu ${ty.name}. ${typeShow(ty.type)})`;
    case "TypeAbs":
      return `<${ty.typeParams.join(", ")}>${typeShow(ty.type)}`;
    case "TypeVar":
      return ty.name;
    case "Undefined":
      return "undefined";
  }
}
