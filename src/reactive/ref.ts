import { BehaviorSubject, share } from "rxjs";
import { ReactiveType } from "./type";
import { EtypeRefRequest, refArrayBuilder } from "./refHelper";
import {
  Ref,
  RefA,
  RefFormater,
  RefO,
  RefOGet,
  RefOSet,
  refInput,
} from "./ref-type";

const TYPE_REF = ["string", "number", "function", "undefined", "boolean"];

/**
 * Реактивная переменная
 * @param value - начальные данные
 * @returns ref переменную.
 */
function ref(value: unknown): RefO | RefA | Ref | null {
  const typeValue = typeof value;
  if (TYPE_REF.includes(typeValue)) {
    const val = value as refInput;

    const subject: BehaviorSubject<refInput> = new BehaviorSubject(val);

    const obj: Ref = {
      type: ReactiveType.Ref,
      value: val,
      $sub: subject.pipe(share()),
      formate: function (func): RefFormater {
        return {
          type: ReactiveType.RefFormater,
          value: func,
          parent: this,
        };
      },
    };

    return new Proxy(obj, {
      set(t: Ref, p: string, v: unknown) {
        if (p === "value") {
          const s = Reflect.set(t, p, v);
          if (TYPE_REF.includes(typeof v)) {
            t.$sub.next(v);
          }
          return s;
        }
        return Reflect.set(t, p, v);
      },
      deleteProperty(_: Ref, p: string) {
        if (["value", "$sub"].includes(p)) {
          return false;
        }
        return true;
      },
    });
  }

  if (Array.isArray(value)) {
    const subject: BehaviorSubject<unknown[]> = new BehaviorSubject(value);

    const obj: RefA = {
      type: ReactiveType.RefA,
      value: null,
      $sub: subject.pipe(share()),
      for: function (func: (item: unknown, index: number) => unknown) {
        return {
          type: ReactiveType.RefArrFor,
          value: func,
          parent: this,
        };
      },
    };

    const arr = refArrayBuilder(value, obj);

    obj["value"] = arr;

    const refProxy = new Proxy(obj, {
      set(t: RefA, p: string, v: unknown[]) {
        if (p === "value") {
          const newAr = refArrayBuilder(v, obj);
          t.value = newAr;

          obj.$sub.next({
            type: EtypeRefRequest.delete,
            start: 0,
            count: t.value.length,
          });

          obj.$sub.next({
            type: EtypeRefRequest.insert,
            dir: "right",
            value: v,
          });
        }
        return true;
      },
      deleteProperty() {
        return false;
      },
    });

    return refProxy;
  }

  if (typeValue === "object") {
    const subject = new BehaviorSubject(value);

    const reof: RefO = new Proxy(
      {
        type: ReactiveType.RefO,
        $sub: subject.pipe(share()),
        value: null,
      },
      {
        get(t: any, p: string | symbol): unknown | RefOGet {
          if (p in t) {
            return t[p];
          }

          if (t.value !== null && !(p in t)) {
            if (typeof t.value[p] === "object" && !Array.isArray(t.value[p])) {
              return t.value[p];
            }

            return {
              type: ReactiveType.RefO,
              isDefined: p in t.value,
              proxy: reof,
              key: p,
            };
          }
        },
      },
    );

    const valueProxy = new Proxy(value as Record<string, unknown>, {
      set(t, prop, value: unknown) {
        const s = Reflect.set(t, prop, value);

        reof.$sub.next({
          type: ReactiveType.RefO,
          key: prop,
          value,
        } as RefOSet);
        return s;
      },
    });

    reof.value = valueProxy;

    return reof;
  }

  return null;
}

export { ref, Ref };
