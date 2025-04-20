import { error } from "npm:tiny-ts-parser";

type Type =
  | { tag: "Boolean" }
  | { tag: "Number" }
  | { tag: "Func"; params: Param[]; retType: Type }
  | { tag: "TypeAbs"; typeParams: string[]; type: Type }
  | { tag: "TypeVar"; name: string };

type Param = { name: string; type: Type };

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
  | { tag: "typeAbs"; typeParams: string[]; body: Term }
  | { tag: "typeApp"; typeAbs: Term; typeArgs: Type[] };

type TypeEnv = Record<string, Type>;

function subst(ty: Type, tyVarName: string, repTy: Type): Type {
  switch (ty.tag) {
    case "Boolean":
    case "Number":
      return ty;
    case "Func": {
      const params = ty.params.map(
        ({ name, type }) => ({ name, type: subst(type, tyVarName, repTy) }),
      );
      const retType = subst(ty.retType, tyVarName, repTy);
      return { tag: "Func", params, retType };
    }
    case "TypeAbs": {
      //if (ty.typeParams.includes(tyVarName)) return ty;
      const newType = subst(ty.type, tyVarName, repTy);
      return { tag: "TypeAbs", typeParams: ty.typeParams, type: newType };
    }
    case "TypeVar": {
      return ty.name === tyVarName ? repTy : ty;
    }
  }
}

function typeEqSub(ty1: Type, ty2: Type, map: Record<string, string>): boolean {
  switch (ty2.tag) {
    case "Boolean":
      return ty1.tag === "Boolean";
    case "Number":
      return ty1.tag === "Number";
    case "Func": {
      if (ty1.tag !== "Func") return false;
      if (ty1.params.length !== ty2.params.length) return false;
      for (let i = 0; i < ty1.params.length; i++) {
        if (!typeEqSub(ty1.params[i].type, ty2.params[i].type, map)) {
          return false;
        }
      }
      if (!typeEqSub(ty1.retType, ty2.retType, map)) return false;
      return true;
    }
    case "TypeAbs": {
      if (ty1.tag !== "TypeAbs") return false;
      if (ty1.typeParams.length !== ty2.typeParams.length) return false;
      const newMap = { ...map };
      for (let i = 0; i < ty1.typeParams.length; i++) {
        newMap[ty1.typeParams[i]] = ty2.typeParams[i];
      }
      return typeEqSub(ty1.type, ty2.type, newMap);
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

function typeEq(ty1: Type, ty2: Type, tyVars: string[]): boolean {
  const map: Record<string, string> = {};
  for (const tyVar of tyVars) map[tyVar] = tyVar;
  return typeEqSub(ty1, ty2, map);
}

export function typecheck(t: Term, tyEnv: TypeEnv, tyVars: string[]): Type {
  switch (t.tag) {
    case "true":
      return { tag: "Boolean" };
    case "false":
      return { tag: "Boolean" };
    case "if": {
      const condTy = typecheck(t.cond, tyEnv, tyVars);
      if (condTy.tag !== "Boolean") error("boolean expected", t.cond);
      const thnTy = typecheck(t.thn, tyEnv, tyVars);
      const elsTy = typecheck(t.els, tyEnv, tyVars);
      if (!typeEq(thnTy, elsTy, tyVars)) {
        error("then and else have different types", t);
      }
      return thnTy;
    }
    case "number":
      return { tag: "Number" };
    case "add": {
      const leftTy = typecheck(t.left, tyEnv, tyVars);
      if (leftTy.tag !== "Number") error("number expected", t.left);
      const rightTy = typecheck(t.right, tyEnv, tyVars);
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
      const retType = typecheck(t.body, newTyEnv, tyVars);
      return { tag: "Func", params: t.params, retType };
    }
    case "call": {
      const funcTy = typecheck(t.func, tyEnv, tyVars);
      if (funcTy.tag !== "Func") error("function type expected", t.func);
      if (funcTy.params.length !== t.args.length) {
        error("wrong number of arguments", t);
      }
      for (let i = 0; i < t.args.length; i++) {
        const argTy = typecheck(t.args[i], tyEnv, tyVars);
        if (!typeEq(argTy, funcTy.params[i].type, tyVars)) {
          error("parameter type mismatch", t.args[i]);
        }
      }
      return funcTy.retType;
    }
    case "seq":
      typecheck(t.body, tyEnv, tyVars);
      return typecheck(t.rest, tyEnv, tyVars);
    case "const": {
      const ty = typecheck(t.init, tyEnv, tyVars);
      const newTyEnv = { ...tyEnv, [t.name]: ty };
      return typecheck(t.rest, newTyEnv, tyVars);
    }
    case "typeAbs": {
      const tyVars2 = [...tyVars];
      for (const tyVar of t.typeParams) tyVars2.push(tyVar);
      const bodyTy = typecheck(t.body, tyEnv, tyVars2);
      return { tag: "TypeAbs", typeParams: t.typeParams, type: bodyTy };
    }
    case "typeApp": {
      const bodyTy = typecheck(t.typeAbs, tyEnv, tyVars);
      if (bodyTy.tag !== "TypeAbs") {
        error("type abstraction expected", t.typeAbs);
      }
      if (bodyTy.typeParams.length !== t.typeArgs.length) {
        error("wrong number of type arguments", t);
      }
      let newTy = bodyTy.type;
      for (let i = 0; i < bodyTy.typeParams.length; i++) {
        newTy = subst(newTy, bodyTy.typeParams[i], t.typeArgs[i]);
      }
      return newTy;
    }
  }
}
