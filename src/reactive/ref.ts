import { BehaviorSubject, Subject, share } from "rxjs";
import { Reactive, ReactiveType } from "./type";
import { EtypeRefRequest, refArrayBuilder } from "./refHelper";

type refInput = string | number | (() => any);

// interface Ref extends Reactive {
//   value: refInput;
//   $sub: any;
//   formate: (func: (e: any) => any) => any;
//   node?: any;
// }

export interface RefA extends Reactive {
  value: any;
  $sub: any;
  for: (item: any, index: number) => any;
}

export interface RefO extends Reactive {
  $sub: BehaviorSubject<any>;
  value: Record<string, any> | null;
}

export interface RefOF extends Reactive {
  key: string;
  value: RefO;
}

export interface RefFormater {
  type: ReactiveType;
  value: (e: any) => any;
  parent: any;
}

const TYPE_REF = ["string", "number", "function", "undefined", "boolean"];

/**
 * Реактивная переменная
 * @param value - начальные данные
 * @returns ref переменную.
 */
// function ref(value: unknown) {
//   let context = this;
//   if (context === undefined) context = {};

//   const typeValue = typeof value;
//   if (TYPE_REF.includes(typeValue)) {
//     const val = value as refInput;

//     const subject: BehaviorSubject<refInput> = new BehaviorSubject(val);

//     const obj: Ref = {
//       type: ReactiveType.Ref,
//       value: val,
//       $sub: !context.__CTX_TEST__ ? subject.pipe(share()) : {},
//       formate: !context.__CTX_TEST__
//         ? function (func): RefFormater {
//             return {
//               type: ReactiveType.RefFormater,
//               value: func,
//               parent: this,
//             };
//           }
//         : ({} as any),
//     };

//     return new Proxy(obj, {
//       set(t: Ref, p: string, v: unknown) {
//         if (p === "value") {
//           const s = Reflect.set(t, p, v);
//           if (TYPE_REF.includes(typeof v)) {
//             t.$sub.next(v);
//           }
//           return s;
//         }
//         return Reflect.set(t, p, v);
//       },
//       get(t, p) {
//         if (p === Symbol.toPrimitive) {
//           return () => t.value;
//         }

//         return Reflect.get(t, p);
//       },
//       deleteProperty(t: Ref, p: string) {
//         if (["value", "$sub"].includes(p)) {
//           return false;
//         }
//         return true;
//       },
//     });
//   }

//   if (Array.isArray(value)) {
//     const subject: BehaviorSubject<any> = new BehaviorSubject(value);

//     const obj: RefA = {
//       type: ReactiveType.RefA,
//       value: null,
//       $sub: subject.pipe(share()),
//       for: function (func) {
//         return {
//           type: ReactiveType.RefArrFor,
//           value: func,
//           parent: this,
//         };
//       },
//     };

//     const arr = refArrayBuilder(value, obj);

//     obj["value"] = arr;

//     const refProxy = new Proxy(obj, {
//       get(t, p) {
//         if (p === Symbol.toPrimitive) {
//           return () => t.value;
//         }

//         return Reflect.get(t, p);
//       },
//       set(t: RefA, p: string, v: any) {
//         if (p === "value") {
//           const newAr = refArrayBuilder(v, obj);
//           t.value = newAr;

//           obj.$sub.next({
//             type: EtypeRefRequest.delete,
//             start: 0,
//             count: t.value.length,
//           });

//           obj.$sub.next({
//             type: EtypeRefRequest.insert,
//             dir: "right",
//             value: v,
//           });
//         }
//         return true;
//       },
//       deleteProperty() {
//         return false;
//       },
//     });

//     return refProxy;
//   }

//   if (value && typeValue === "object") {
//     const subject = new BehaviorSubject(value);

//     const reof: RefO = new Proxy(
//       {
//         type: ReactiveType.RefO,
//         $sub: subject.pipe(share()),
//         value: null,
//       },
//       {
//         get(t: any, p) {
//           if (p in t) {
//             return t[p];
//           }

//           if (t.value !== null && !(p in t)) {
//             if (typeof t.value[p] === "object" && !Array.isArray(t.value[p])) {
//               return t.value[p];
//             }

//             if (p in t.value) {
//               return {
//                 type: ReactiveType.RefO,
//                 isDefined: true,
//                 proxy: reof,
//                 key: p,
//               };
//             } else {
//               return {
//                 type: ReactiveType.RefO,
//                 isDefined: false,
//                 proxy: reof,
//                 key: p,
//               };
//             }
//           }
//         },
//       },
//     );

//     const valueProxy = new Proxy(value as Record<string, any>, {
//       set(t, prop, value) {
//         const s = Reflect.set(t, prop, value);

//         reof.$sub.next({
//           type: ReactiveType.RefO,
//           key: prop,
//           value,
//         });
//         return s;
//       },
//     });

//     reof.value = valueProxy;

//     return reof;
//   }
// }

function createReactiveObject(obj: any, reactive: any) {
  return new Proxy(obj, {
    set(t, p, v) {
      const res = Reflect.set(t, p, v);
      reactive.$sub.next(t);
      return res;
    },
  });
}

function returnType(v: unknown): string {
  return typeof v === "object"
    ? Array.isArray(v)
      ? "array"
      : v === null
      ? "null"
      : "object"
    : v === undefined
    ? "undefined"
    : "primitive";
}

type Ref<T> = {
  type: ReactiveType;
  value: T;
  $sub: BehaviorSubject<T> | Record<string, any>;
};

function ref<T>(value: T) {
  const context = this ?? {};

  const subject = new BehaviorSubject<T>(value);

  const reactive: Ref<T> = {
    type: ReactiveType.Ref,
    value,
    $sub: !context.__CTX_TEST__ ? subject : {},
  };

  reactive.value = Array.isArray(value)
    ? refArrayBuilder(value, reactive)
    : value && typeof value === "object"
    ? createReactiveObject(value, reactive)
    : value;

  let type = returnType(value);
  const reactiveObject = new Proxy(reactive, {
    set(t: Ref<T>, p, value) {
      if (p === "value") {
        const newType = returnType(value);
        if (newType !== type) {
          type = newType;
          if (newType === "array" || Array.isArray(value)) {
            t.value = refArrayBuilder(value, reactive) as any;
          } else if (value && typeof value === "object") {
            t.value = createReactiveObject(value, reactive);
          } else {
            t.value = value;
          }
        } else {
          if (Array.isArray(value)) {
            t.value = refArrayBuilder(value, reactive) as any;
          } else {
            t.value = value;
          }
        }

        t.$sub.next(value);
        return true;
      }

      return Reflect.set(t, p, value);
    },
    get(t, p: string) {
      if (type === "object") {
        if (Object.keys(reactive).includes(p)) return Reflect.get(t, p);

        return {
          type: ReactiveType.RefO,
          key: p,
          $sub: t.$sub,
          parent: t.value,
        };
      }

      return Reflect.get(t, p);
    },
  });

  return reactiveObject;
}

export { ref, Ref };
