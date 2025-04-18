import { error } from "tiny-ts-parser";

type Type =
  | { tag: "Boolean" }
  | { tag: "Number" }
  | { tag: "String" }
  | { tag: "Option"; elemType: Type }
  | { tag: "Array"; elemType: Type }
  | { tag: "Record"; elemType: Type }
  | { tag: "Func"; params: Param[]; retType: Type }
  | { tag: "Object"; props: PropertyType[] }
  | { tag: "TaggedUnion"; variants: VariantType[] }
  | { tag: "Rec"; name: string; type: Type }
  | { tag: "TypeVar"; name: string }
  | { tag: "Undefined" };

type Param = { name: string; type: Type };
type PropertyType = { name: string; type: Type };
type VariantType = { tagLabel: string; props: PropertyType[] };

type Term =
  | { tag: "true" }
  | { tag: "false" }
  | { tag: "not"; cond: Term }
  | { tag: "compare"; op: string; left: Term; right: Term }
  | { tag: "if"; cond: Term; thn: Term; els: Term }
  | { tag: "number"; n: number }
  | { tag: "add"; left: Term; right: Term }
  | { tag: "string"; s: string }
  | { tag: "var"; name: string }
  | { tag: "func"; params: Param[]; body: Term }
  | { tag: "call"; func: Term; args: Term[] }
  | { tag: "seq"; body: Term; rest: Term }
  | { tag: "const"; name: string; init: Term; rest: Term }
  | { tag: "assign"; name: string; init: Term }
  | { tag: "for"; ary: Term; body: Term; idx: string; rest: Term }
  | { tag: "forOf"; ary: Term; body: Term; var: string; rest: Term }
  | { tag: "arrayNew"; aryType: Type }
  | { tag: "arrayExt"; ary: Term; val: Term }
  | { tag: "recordNew"; recordType: Type }
  | { tag: "recordCopy"; record: Term }
  | { tag: "recordExt"; record: Term; key: Term; val: Term }
  | { tag: "recordIn"; record: Term; key: Term }
  | { tag: "member"; base: Term; index: Term }
  | { tag: "objectNew"; props: PropertyTerm[] }
  | { tag: "objectGet"; obj: Term; propName: string }
  | { tag: "taggedUnionNew"; tagLabel: string; props: PropertyTerm[]; as: Type }
  | { tag: "taggedUnionExt"; term: Term; as: Type }
  | { tag: "taggedUnionGet"; varName: string; clauses: VariantTerm[]; defaultClause: Term }
  | {
    tag: "recFunc";
    funcName: string;
    params: Param[];
    retType: Type;
    body: Term;
    rest: Term;
  }
  | { tag: "undefined" };

type PropertyTerm = { name: string; term: Term };
type VariantTerm = { tagLabel: string; term: Term };

type TypeEnv = Record<string, Type>;

function typeEqNaive(ty1: Type, ty2: Type, map: Record<string, string>): boolean {
  if (ty1.tag === "Undefined") return true;
  if (ty2.tag === "Undefined") return true;

  switch (ty2.tag) {
    case "Boolean": {
      return ty1.tag === "Boolean";
    }
    case "Number": {
      return ty1.tag === "Number";
    }
    case "String": {
      return ty1.tag === "String";
    }
    case "Option": {
      if (ty1.tag !== "Option") return false;
      return typeEqNaive(ty1.elemType, ty2.elemType, map);
    }
    case "Array": {
      if (ty1.tag !== "Array") return false;
      return typeEqNaive(ty1.elemType, ty2.elemType, map);
    }
    case "Record": {
      if (ty1.tag !== "Record") return false;
      return typeEqNaive(ty1.elemType, ty2.elemType, map);
    }
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
        const prop2 = ty2.props.find((prop2: PropertyType) => prop1.name === prop2.name);
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
          (variant2: VariantType) => variant1.tagLabel === variant2.tagLabel,
        );
        if (!variant2) return false;
        if (variant1.props.length !== variant2.props.length) return false;
        for (const prop1 of variant1.props) {
          const prop2 = variant2.props.find((prop2: PropertyType) => prop1.name === prop2.name);
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
      return map[ty1.name] === ty2.name;
    }
  }
}

function expandType(ty: Type, tyVarName: string, repTy: Type): Type {
  switch (ty.tag) {
    case "Boolean":
      return ty as Type;
    case "Number":
      return ty as Type;
    case "String":
      return ty as Type;
    case "Option": {
      return { tag: "Option", elemType: expandType(ty.elemType, tyVarName, repTy) } as Type;
    }
    case "Array": {
      return { tag: "Array", elemType: expandType(ty.elemType, tyVarName, repTy) } as Type;
    }
    case "Record": {
      return { tag: "Record", elemType: expandType(ty.elemType, tyVarName, repTy) } as Type;
    }
    case "Func": {
      let params = [] as Param[];
      for (const param of ty.params) {
        params = [...params, { name: param.name, type: expandType(param.type, tyVarName, repTy) }];
      }
      const retType = expandType(ty.retType, tyVarName, repTy);
      return { tag: "Func", params, retType } as Type;
    }
    case "Object": {
      let props = [] as PropertyType[];
      for (const prop of ty.props) {
        props = [...props, { name: prop.name, type: expandType(prop.type, tyVarName, repTy) }];
      }
      return { tag: "Object", props } as Type;
    }
    case "TaggedUnion": {
      let variants = [] as VariantType[];
      for (const variant of ty.variants) {
        let props = [] as PropertyType[];
        for (const prop of variant.props) {
          props = [...props, { name: prop.name, type: expandType(prop.type, tyVarName, repTy) }];
        }
        variants = [...variants, { tagLabel: variant.tagLabel, props }];
      }
      return { tag: "TaggedUnion", variants } as Type;
    }
    case "Rec": {
      if (ty.name === tyVarName) return ty as Type;
      return { tag: "Rec", name: ty.name, type: expandType(ty.type, tyVarName, repTy) } as Type;
    }
    case "TypeVar": {
      return ty.name === tyVarName ? repTy : ty as Type;
    }
    case "Undefined":
      return { tag: "Undefined" } as Type;
  }
}

function simplifyType(ty: Type): Type {
  if (ty.tag === "Rec") return expandType(ty.type, ty.name, { tag: "Rec", name: ty.name, type: ty.type } as Type);
  return ty as Type;
}

type IfType =
  | { tag: "Option"; elemType: Type; name: string; thn: Term; els: Term }
  | { tag: "Boolean"; thn: Term; els: Term };
function checkIfType(cond: Term, thn: Term, els: Term): IfType {
  if (cond.tag === "var") {
    return { tag: "Option", name: cond.name, thn, els } as IfType;
  } else if (cond.tag === "not") {
    const cond2 = cond.cond;
    if (cond2.tag === "var") {
      return { tag: "Option", name: cond2.name, thn: els, els: thn } as IfType;
    } else {
      return { tag: "Boolean" } as IfType;
    }
  } else {
    return { tag: "Boolean" } as IfType;
  }
}

function typeEqSub(ty1: Type, ty2: Type, seen: { left: Type; right: Type }[]): boolean {
  for (const tuple of seen) {
    if (typeEqNaive(tuple.left, ty1, {} as Record<string, string>)) {
      if (typeEqNaive(tuple.right, ty2, {} as Record<string, string>)) {
        return true;
      }
    }
  }
  if (ty1.tag === "Rec") {
    return typeEqSub(simplifyType(ty1 as Type), ty2 as Type, [...seen, { left: ty1 as Type, right: ty2 as Type }]);
  }
  if (ty2.tag === "Rec") {
    return typeEqSub(ty1 as Type, simplifyType(ty2 as Type), [...seen, { left: ty1 as Type, right: ty2 as Type }]);
  }

  if (ty1.tag === "Undefined") return true;
  if (ty2.tag === "Undefined") return true;

  switch (ty2.tag) {
    case "Boolean":
      return ty1.tag === "Boolean";
    case "Number":
      return ty1.tag === "Number";
    case "String":
      return ty1.tag === "String";
    case "Option": {
      if (ty1.tag !== "Option") return false;
      return typeEqSub(ty1.elemType, ty2.elemType, seen);
    }
    case "Array": {
      if (ty1.tag !== "Array") return false;
      return typeEqSub(ty1.elemType, ty2.elemType, seen);
    }
    case "Record": {
      if (ty1.tag !== "Record") return false;
      return typeEqSub(ty1.elemType, ty2.elemType, seen);
    }
    case "Func": {
      if (ty1.tag !== "Func") return false;
      if (ty1.params.length !== ty2.params.length) return false;
      for (let i = 0; i < ty1.params.length; i++) {
        if (!typeEqSub(ty1.params[i].type, ty2.params[i].type, seen)) return false;
      }
      if (!typeEqSub(ty1.retType, ty2.retType, seen)) return false;
      return true;
    }
    case "Object": {
      if (ty1.tag !== "Object") return false;
      if (ty1.props.length !== ty2.props.length) return false;
      for (const prop2 of ty2.props) {
        const prop1 = ty1.props.find((prop1: PropertyType) => prop1.name === prop2.name);
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
          (variant2: VariantType) => variant1.tagLabel === variant2.tagLabel,
        );
        if (!variant2) return false;
        if (variant1.props.length !== variant2.props.length) return false;
        for (const prop1 of variant1.props) {
          const prop2 = variant2.props.find((prop2: PropertyType) => prop1.name === prop2.name);
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
  return typeEqSub(ty1, ty2, [] as { left: Type; right: Type }[]);
}

function typeJoin(ty1: Type, ty2: Type): Type {
  if (ty1.tag !== "Undefined") return ty1 as Type;
  return ty2;
}

export function typecheck(t: Term, tyEnv: TypeEnv): Type {
  switch (t.tag) {
    case "true":
      return { tag: "Boolean" } as Type;
    case "false":
      return { tag: "Boolean" } as Type;
    case "not": {
      const ty = simplifyType(typecheck(t.cond, tyEnv));
      if (ty.tag !== "Boolean") error("boolean expected", t.cond);
      return { tag: "Boolean" } as Type;
    }
    case "compare": {
      const leftTy = simplifyType(typecheck(t.left, tyEnv));
      const rightTy = simplifyType(typecheck(t.right, tyEnv));
      if (!typeEq(leftTy, rightTy)) error("compare different types", t.left);
      return { tag: "Boolean" } as Type;
    }
    case "if": {
      const ifType = checkIfType(t.cond, t.thn, t.els);
      if (ifType.tag === "Option") {
        const condTy = typecheck({ tag: "var", name: ifType.name } as Term, tyEnv);
        if (condTy.tag === "Option") {
          const newTyEnv = { ...tyEnv, [ifType.name]: condTy.elemType };
          const thnTy = typecheck(ifType.thn, newTyEnv);
          const elsTy = typecheck(ifType.els, tyEnv);
          return typeJoin(thnTy, elsTy);
        } else {
          const thnTy = typecheck(t.thn, tyEnv);
          const elsTy = typecheck(t.els, tyEnv);
          if (!typeEq(thnTy, elsTy)) error("then and else have different types", t);
          return typeJoin(thnTy, elsTy);
        }
      } else {
        const thnTy = typecheck(t.thn, tyEnv);
        const elsTy = typecheck(t.els, tyEnv);
        if (!typeEq(thnTy, elsTy)) error("then and else have different types", t);
        return typeJoin(thnTy, elsTy);
      }
    }
    case "number":
      return { tag: "Number" } as Type;
    case "add": {
      const leftTy = simplifyType(typecheck(t.left, tyEnv));
      if (leftTy.tag !== "Number") error("number expected", t.left);
      const rightTy = simplifyType(typecheck(t.right, tyEnv));
      if (rightTy.tag !== "Number") error("number expected", t.right);
      return { tag: "Number" } as Type;
    }
    case "string":
      return { tag: "String" } as Type;
    case "var": {
      if (!(t.name in tyEnv)) error(`unknown variable: ${t.name}`, t);
      return tyEnv[t.name];
    }
    case "func": {
      let newTyEnv = { ...tyEnv };
      for (const param of t.params) {
        newTyEnv = { ...newTyEnv, [param.name]: param.type };
      }
      const retType = typecheck(t.body, newTyEnv);
      return { tag: "Func", params: t.params, retType } as Type;
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
    case "assign": {
      // TODO: const/let check
      if (!(t.name in tyEnv)) error(`unknown variable: ${t.name}`, t);
      const ty = typecheck(t.init, tyEnv);
      if (!typeEq(tyEnv[t.name], ty)) error("type mismatch", t.init);
      return ty;
    }
    case "for": {
      const aryTy = simplifyType(typecheck(t.ary, tyEnv));
      if (aryTy.tag !== "Array") error("array expected", t.ary);
      const newTyEnv: TypeEnv = { ...tyEnv, [t.idx]: { tag: "Number" } as Type };
      const bodyTy = typecheck(t.body, newTyEnv);
      const restTy = typecheck(t.rest, tyEnv);
      if (!typeEq(bodyTy, restTy)) error(`return type is inconsistent`, t);
      return typeJoin(bodyTy, restTy);
    }
    case "forOf": {
      const aryTy = simplifyType(typecheck(t.ary, tyEnv));
      if (aryTy.tag !== "Array") error("array expected", t.ary);
      const newTyEnv: TypeEnv = { ...tyEnv, [t.var]: aryTy.elemType };
      const bodyTy = typecheck(t.body, newTyEnv);
      const restTy = typecheck(t.rest, tyEnv);
      if (!typeEq(bodyTy, restTy)) error(`return type is inconsistent`, t);
      return typeJoin(bodyTy, restTy);
    }
    case "arrayNew": {
      const retTy = t.aryType;
      if (t.aryType.tag !== "Array") error(`arrayNew must have a type "<sometype[]>"`, t);
      return retTy;
    }
    case "arrayExt": {
      const aryTy = simplifyType(typecheck(t.ary, tyEnv));
      if (aryTy.tag !== "Array") error("array expected", t.ary);
      const valTy = simplifyType(typecheck(t.val, tyEnv));
      if (!typeEq(aryTy.elemType, valTy)) error("value type is inconsistent", t.val);
      return aryTy as Type;
    }
    case "recordNew": {
      const retTy = t.recordType;
      if (t.recordType.tag !== "Record") error(`recordNew must have a type "Record<string, sometype>"`, t);
      return retTy;
    }
    case "recordCopy": {
      const recordTy = simplifyType(typecheck(t.record, tyEnv));
      return recordTy;
    }
    case "recordExt": {
      const recordTy = simplifyType(typecheck(t.record, tyEnv));
      if (recordTy.tag !== "Record") error("record expected", t.record);
      const keyTy = simplifyType(typecheck(t.key, tyEnv));
      if (keyTy.tag !== "String") error("string expected", t.key);
      const valTy = simplifyType(typecheck(t.val, tyEnv));
      if (!typeEq(recordTy.elemType, valTy)) error("value type is inconsistent", t.val);
      return recordTy as Type;
    }
    case "recordIn": {
      const recordTy = simplifyType(typecheck(t.record, tyEnv));
      if (recordTy.tag !== "Record") error("record expected", t.record);
      const keyTy = simplifyType(typecheck(t.key, tyEnv));
      if (keyTy.tag !== "String") error("string expected", t.key);
      return { tag: "Boolean" } as Type;
    }
    case "member": {
      const baseTy = simplifyType(typecheck(t.base, tyEnv));
      const indexTy = simplifyType(typecheck(t.index, tyEnv));
      switch (baseTy.tag) {
        case "Array": {
          if (indexTy.tag !== "Number") error("number expected", t.index);
          return baseTy.elemType;
        }
        case "Record": {
          if (indexTy.tag !== "String") error("string expected", t.index);
          return baseTy.elemType;
        }
        default: {
          error("array or record expected", t.base);
          throw new Error("unreachable");
        }
      }
    }
    case "objectNew": {
      let propTypes = [] as PropertyType[];
      for (const prop of t.props) {
        const propTy = typecheck(prop.term, tyEnv);
        propTypes = [...propTypes, { name: prop.name, type: propTy }];
      }
      return { tag: "Object", props: propTypes } as Type;
    }
    case "objectGet": {
      const objectTy = simplifyType(typecheck(t.obj, tyEnv));
      switch (objectTy.tag) {
        case "TaggedUnion": {
          if (objectTy.variants.length === 1) {
            const props = objectTy.variants[0].props;
            const prop = props.find((prop: PropertyType) => prop.name === t.propName);
            if (!prop) error(`unknown property name: ${t.propName}`, t);
            return prop.type;
          }
          if (t.propName !== "tag") error(`only "tag" is readable on tagged union`, t);
          return { tag: "String" } as Type;
        }
        case "Object": {
          const prop = objectTy.props.find((prop: PropertyType) => prop.name === t.propName);
          if (!prop) error(`unknown property name: ${t.propName}`, t);
          return prop.type;
        }
        case "Array": {
          if (t.propName === "length") {
            return { tag: "Number" } as Type;
          } else if (t.propName === "find") {
            return {
              tag: "Func",
              params: [...[] as Param[], {
                name: "f",
                type: {
                  tag: "Func",
                  params: [...[] as Param[], { name: "x", type: objectTy.elemType }],
                  retType: { tag: "Boolean" } as Type,
                } as Type,
              }],
              retType: { tag: "Option", elemType: objectTy.elemType } as Type,
            } as Type;
          } else if (t.propName === "filter") {
            return {
              tag: "Func",
              params: [...[] as Param[], {
                name: "f",
                type: {
                  tag: "Func",
                  params: [...[] as Param[], { name: "x", type: objectTy.elemType }],
                  retType: { tag: "Boolean" } as Type,
                } as Type,
              }],
              retType: { tag: "Array", elemType: objectTy.elemType } as Type,
            } as Type;
          } else {
            error(`only "length", "filter" and "find" are readable on array`, t);
            throw new Error("unreachable");
          }
        }
        default: {
          error("object type expected", t.obj);
          throw new Error("unreachable");
        }
      }
    }
    case "taggedUnionNew": {
      const asTy = simplifyType(t.as);
      if (asTy.tag !== "TaggedUnion") error(`"as" must have a tagged union type`, t);
      const variant = asTy.variants.find((variant: VariantType) => variant.tagLabel === t.tagLabel);
      if (!variant) error(`unknown variant tag: ${t.tagLabel}`, t);
      for (const prop1 of t.props) {
        const prop2 = variant.props.find((prop2: PropertyType) => prop1.name === prop2.name);
        if (!prop2) error(`unknown property: ${prop1.name}`, t);
        const actualTy = typecheck(prop1.term, tyEnv);
        if (!typeEq(actualTy, prop2.type)) {
          error("tagged union's term has a wrong type", prop1.term);
        }
      }
      return t.as;
    }
    case "taggedUnionExt": {
      const termTy = simplifyType(typecheck(t.term, tyEnv));
      const retTy = simplifyType(t.as);
      if (retTy.tag !== "TaggedUnion") error(`term must have a tagged union type`, t);
      if (termTy.tag !== "TaggedUnion") error(`term must have a tagged union type`, t);
      for (const variant0 of termTy.variants) {
        let found = false;
        for (const variant1 of retTy.variants) {
          if (variant0.tagLabel === variant1.tagLabel) {
            found = true;
            for (const prop0 of variant0.props) {
              const found = variant1.props.find((prop: PropertyType) => prop0.name === prop.name);
              if (!found) error(`unknown property: ${prop0.name}`, t);
              if (!typeEq(prop0.type, found.type)) error(`tagged union has a wrong property type: ${prop0.name}`, t);
            }
            if (variant0.props.length !== variant1.props.length) {
              error(`tagged union has a wrong number of properties: ${variant0.tagLabel}`, t);
            }
          }
        }
        if (!found) error(`tagged union has a wrong variant: ${variant0.tagLabel}`, t);
      }
      return retTy as Type;
    }
    case "taggedUnionGet": {
      const variantTy = simplifyType(tyEnv[t.varName]);
      if (variantTy.tag !== "TaggedUnion") error(`variable ${t.varName} must have a tagged union type`, t);
      const defaultVariants = variantTy.variants.filter((variant: VariantType) => {
        for (const clause of t.clauses) {
          if (variant.tagLabel === clause.tagLabel) return false;
        }
        return true;
      });
      const defaultLocalTy: Type = { tag: "TaggedUnion", variants: defaultVariants } as Type;
      const newTyEnv = { ...tyEnv, [t.varName]: defaultLocalTy };
      let retTy = typecheck(t.defaultClause, newTyEnv);
      for (const clause of t.clauses) {
        const variant = variantTy.variants.find((variant: VariantType) => variant.tagLabel === clause.tagLabel);
        if (!variant) error(`tagged union type has no case: ${clause.tagLabel}`, clause.term);
        const newVariants = [...[] as VariantType[], { tagLabel: clause.tagLabel, props: variant.props }];
        const localTy = { tag: "TaggedUnion", variants: newVariants } as Type;
        const newTyEnv = { ...tyEnv, [t.varName]: localTy };
        const retTy1 = typecheck(clause.term, newTyEnv);
        if (!typeEq(retTy, retTy1)) error("clauses has different types", t);
        retTy = typeJoin(retTy, retTy1);
      }
      return retTy;
    }
    case "recFunc": {
      const funcTy: Type = { tag: "Func", params: t.params, retType: t.retType } as Type;
      let newTyEnv = { ...tyEnv };
      for (const param of t.params) {
        newTyEnv = { ...newTyEnv, [param.name]: param.type };
      }
      const newTyEnv2 = { ...newTyEnv, [t.funcName]: funcTy };
      const retTy = typecheck(t.body, newTyEnv2);
      if (!typeEq(t.retType, retTy)) error("wrong return type", t);
      const newTyEnv3 = { ...tyEnv, [t.funcName]: funcTy };
      return typecheck(t.rest, newTyEnv3);
    }
    case "undefined": {
      return { tag: "Undefined" } as Type;
    }
  }
}

1;
