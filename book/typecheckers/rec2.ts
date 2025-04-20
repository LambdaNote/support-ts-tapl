import { error } from "npm:tiny-ts-parser";

type Type =
  | { tag: "Boolean" }
  | { tag: "Number" }
  | { tag: "Func"; params: Param[]; retType: Type }
  | { tag: "Object"; props: PropertyType[] }
  | { tag: "TaggedUnion"; variants: VariantType[] }
  | { tag: "Rec"; name: string; type: Type }
  | { tag: "TypeVar"; name: string };

type Param = { name: string; type: Type };
type PropertyType = { name: string; type: Type };
type VariantType = { tagLabel: string; props: PropertyType[] };

type Term =
  | { tag: "true" }
  | { tag: "false" }
  | { tag: "if"; cond: Term; thn: Term; els: Term }
  | { tag: "number"; n: number }
  | { tag: "add"; left: Term; right: Term }
  | { tag: "var"; name: string }
  | { tag: "func"; params: Param[]; body: Term }
  | { tag: "call"; func: Term; args: Term[] }
  | { tag: "seq"; body: Term; rest: Term }
  | { tag: "const"; name: string; init: Term; rest: Term }
  | { tag: "objectNew"; props: PropertyTerm[] }
  | { tag: "objectGet"; obj: Term; propName: string }
  | { tag: "taggedUnionNew"; tagLabel: string; props: PropertyTerm[]; as: Type }
  | { tag: "taggedUnionGet"; varName: string; clauses: VariantTerm[] }
  | {
    tag: "recFunc";
    funcName: string;
    params: Param[];
    retType: Type;
    body: Term;
    rest: Term;
  };

type PropertyTerm = { name: string; term: Term };
type VariantTerm = { tagLabel: string; term: Term };

type TypeEnv = Record<string, Type>;

function typeEqNaive(ty1: Type, ty2: Type, map: Record<string, string>): boolean {
  switch (ty2.tag) {
    case "Boolean":
    case "Number":
      return ty1.tag === ty2.tag;
    case "Func": {
      if (ty1.tag !== "Func") return false;
      for (let i = 0; i < ty1.params.length; i++) {
        if (!typeEqNaive(ty1.params[i].type, ty2.params[i].type, map)) {
          return false;
        }
      }
      if (!typeEqNaive(ty1.retType, ty2.retType, map)) return false;
      return true;
    }
    case "Object": {
      if (ty1.tag !== "Object") return false;
      if (ty1.props.length !== ty2.props.length) return false;
      for (const prop1 of ty1.props) {
        const prop2 = ty2.props.find((prop2) => prop1.name === prop2.name);
        if (!prop2) return false;
        if (!typeEqNaive(prop1.type, prop2.type, map)) return false;
      }
      return true;
    }
    case "TaggedUnion": {
      if (ty1.tag !== "TaggedUnion") return false;
      if (ty1.variants.length !== ty2.variants.length) return false;
      for (const variant1 of ty1.variants) {
        const variant2 = ty2.variants.find(
          (variant2) => variant1.tagLabel === variant2.tagLabel,
        );
        if (!variant2) return false;
        if (variant1.props.length !== variant2.props.length) return false;
        for (const prop1 of variant1.props) {
          const prop2 = variant2.props.find((prop2) => prop1.name === prop2.name);
          if (!prop2) return false;
          if (!typeEqNaive(prop1.type, prop2.type, map)) return false;
        }
      }
      return true;
    }
    case "Rec": {
      if (ty1.tag !== "Rec") return false;
      const newMap = { ...map, [ty1.name]: ty2.name };
      return typeEqNaive(ty1.type, ty2.type, newMap);
    }
    case "TypeVar": {
      if (ty1.tag !== "TypeVar") return false;
      if (map[ty1.name] === undefined) {
        throw new Error(`unknown type variable: ${ty1.name}`);
      }
      return map[ty1.name] === ty2.name;
    }
  }
}

function expandType(ty: Type, tyVarName: string, repTy: Type): Type {
  switch (ty.tag) {
    case "Boolean":
    case "Number":
      return ty;
    case "Func": {
      const params = ty.params.map(
        ({ name, type }) => ({ name, type: expandType(type, tyVarName, repTy) }),
      );
      const retType = expandType(ty.retType, tyVarName, repTy);
      return { tag: "Func", params, retType };
    }
    case "Object": {
      const props = ty.props.map(
        ({ name, type }) => ({ name, type: expandType(type, tyVarName, repTy) }),
      );
      return { tag: "Object", props };
    }
    case "TaggedUnion": {
      const variants = ty.variants.map(({ tagLabel, props }) => {
        const newProps = props.map(
          ({ name, type }) => ({ name, type: expandType(type, tyVarName, repTy) }),
        );
        return { tagLabel, props: newProps };
      });
      return { tag: "TaggedUnion", variants };
    }
    case "Rec": {
      if (ty.name === tyVarName) return ty;
      const newType = expandType(ty.type, tyVarName, repTy);
      return { tag: "Rec", name: ty.name, type: newType };
    }
    case "TypeVar": {
      return ty.name === tyVarName ? repTy : ty;
    }
  }
}

function simplifyType(ty: Type): Type {
  switch (ty.tag) {
    case "Rec":
      return simplifyType(expandType(ty.type, ty.name, ty));
    default:
      return ty;
  }
}

function typeEqSub(ty1: Type, ty2: Type, seen: [Type, Type][]): boolean {
  for (const [ty1_, ty2_] of seen) {
    if (typeEqNaive(ty1_, ty1, {}) && typeEqNaive(ty2_, ty2, {})) return true;
  }
  if (ty1.tag === "Rec") {
    return typeEqSub(simplifyType(ty1), ty2, [...seen, [ty1, ty2]]);
  }
  if (ty2.tag === "Rec") {
    return typeEqSub(ty1, simplifyType(ty2), [...seen, [ty1, ty2]]);
  }

  switch (ty2.tag) {
    case "Boolean":
      return ty1.tag === "Boolean";
    case "Number":
      return ty1.tag === "Number";
    case "Func": {
      if (ty1.tag !== "Func") return false;
      if (ty1.params.length !== ty2.params.length) return false;
      for (let i = 0; i < ty1.params.length; i++) {
        if (!typeEqSub(ty1.params[i].type, ty2.params[i].type, seen)) {
          return false;
        }
      }
      if (!typeEqSub(ty1.retType, ty2.retType, seen)) return false;
      return true;
    }
    case "Object": {
      if (ty1.tag !== "Object") return false;
      if (ty1.props.length !== ty2.props.length) return false;
      for (const prop2 of ty2.props) {
        const prop1 = ty1.props.find((prop1) => prop1.name === prop2.name);
        if (!prop1) return false;
        if (!typeEqSub(prop1.type, prop2.type, seen)) return false;
      }
      return true;
    }
    case "TaggedUnion": {
      if (ty1.tag !== "TaggedUnion") return false;
      if (ty1.variants.length !== ty2.variants.length) return false;
      for (const variant1 of ty1.variants) {
        const variant2 = ty2.variants.find(
          (variant2) => variant1.tagLabel === variant2.tagLabel,
        );
        if (!variant2) return false;
        if (variant1.props.length !== variant2.props.length) return false;
        for (const prop1 of variant1.props) {
          const prop2 = variant2.props.find((prop2) => prop1.name === prop2.name);
          if (!prop2) return false;
          if (!typeEqSub(prop1.type, prop2.type, seen)) return false;
        }
      }
      return true;
    }
    case "TypeVar":
      throw "unreachable";
  }
}

function typeEq(ty1: Type, ty2: Type): boolean {
  return typeEqSub(ty1, ty2, []);
}

export function typecheck(t: Term, tyEnv: TypeEnv): Type {
  switch (t.tag) {
    case "true":
      return { tag: "Boolean" };
    case "false":
      return { tag: "Boolean" };
    case "if": {
      const condTy = simplifyType(typecheck(t.cond, tyEnv));
      if (condTy.tag !== "Boolean") error("boolean expected", t.cond);
      const thnTy = typecheck(t.thn, tyEnv);
      const elsTy = typecheck(t.els, tyEnv);
      if (!typeEq(thnTy, elsTy)) {
        error("then and else have different types", t);
      }
      return thnTy;
    }
    case "number":
      return { tag: "Number" };
    case "add": {
      const leftTy = simplifyType(typecheck(t.left, tyEnv));
      if (leftTy.tag !== "Number") error("number expected", t.left);
      const rightTy = simplifyType(typecheck(t.right, tyEnv));
      if (rightTy.tag !== "Number") error("number expected", t.right);
      return { tag: "Number" };
    }
    case "var": {
      if (tyEnv[t.name] === undefined) error(`unknown variable: ${t.name}`, t);
      return tyEnv[t.name];
    }
    case "func": {
      const newTyEnv = { ...tyEnv };
      for (const { name, type } of t.params) {
        newTyEnv[name] = type;
      }
      const retType = typecheck(t.body, newTyEnv);
      return { tag: "Func", params: t.params, retType };
    }
    case "call": {
      const funcTy = simplifyType(typecheck(t.func, tyEnv));
      if (funcTy.tag !== "Func") error("function type expected", t.func);
      if (funcTy.params.length !== t.args.length) {
        error("wrong number of arguments", t);
      }
      for (let i = 0; i < t.args.length; i++) {
        const argTy = typecheck(t.args[i], tyEnv);
        if (!typeEq(argTy, funcTy.params[i].type)) {
          error("parameter type mismatch", t.args[i]);
        }
      }
      return funcTy.retType;
    }
    case "seq":
      typecheck(t.body, tyEnv);
      return typecheck(t.rest, tyEnv);
    case "const": {
      const ty = typecheck(t.init, tyEnv);
      const newTyEnv = { ...tyEnv, [t.name]: ty };
      return typecheck(t.rest, newTyEnv);
    }
    case "objectNew": {
      const props = t.props.map(
        ({ name, term }) => ({ name, type: typecheck(term, tyEnv) }),
      );
      return { tag: "Object", props };
    }
    case "objectGet": {
      const objectTy = simplifyType(typecheck(t.obj, tyEnv));
      if (objectTy.tag !== "Object") error("object type expected", t.obj);
      const prop = objectTy.props.find((prop) => prop.name === t.propName);
      if (!prop) error(`unknown property name: ${t.propName}`, t);
      return prop.type;
    }
    case "taggedUnionNew": {
      const asTy = simplifyType(t.as);
      if (asTy.tag !== "TaggedUnion") {
        error(`"as" must have a tagged union type`, t);
      }
      const variant = asTy.variants.find(
        (variant) => variant.tagLabel === t.tagLabel,
      );
      if (!variant) error(`unknown variant tag: ${t.tagLabel}`, t);
      for (const prop1 of t.props) {
        const prop2 = variant.props.find((prop2) => prop1.name === prop2.name);
        if (!prop2) error(`unknown property: ${prop1.name}`, t);
        const actualTy = typecheck(prop1.term, tyEnv);
        if (!typeEq(actualTy, prop2.type)) {
          error("tagged union's term has a wrong type", prop1.term);
        }
      }
      return t.as;
    }
    case "taggedUnionGet": {
      const variantTy = simplifyType(tyEnv[t.varName]);
      if (variantTy.tag !== "TaggedUnion") {
        error(`variable ${t.varName} must have a tagged union type`, t);
      }
      let retTy: Type | null = null;
      for (const clause of t.clauses) {
        const variant = variantTy.variants.find(
          (variant) => variant.tagLabel === clause.tagLabel,
        );
        if (!variant) {
          error(`tagged union type has no case: ${clause.tagLabel}`, clause.term);
        }
        const localTy: Type = { tag: "Object", props: variant.props };
        const newTyEnv = { ...tyEnv, [t.varName]: localTy };
        const clauseTy = typecheck(clause.term, newTyEnv);
        if (retTy) {
          if (!typeEq(retTy, clauseTy)) {
            error("clauses has different types", clause.term);
          }
        } else {
          retTy = clauseTy;
        }
      }
      if (variantTy.variants.length !== t.clauses.length) {
        error("switch case is not exhaustive", t);
      }
      return retTy!;
    }
    case "recFunc": {
      const funcTy: Type = { tag: "Func", params: t.params, retType: t.retType };
      const newTyEnv = { ...tyEnv };
      for (const { name, type } of t.params) {
        newTyEnv[name] = type;
      }
      newTyEnv[t.funcName] = funcTy;
      const retTy = typecheck(t.body, newTyEnv);
      if (!typeEq(t.retType, retTy)) error("wrong return type", t);
      const newTyEnv2 = { ...tyEnv, [t.funcName]: funcTy };
      return typecheck(t.rest, newTyEnv2);
    }
  }
}
