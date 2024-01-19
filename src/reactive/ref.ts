import { BehaviorSubject } from "rxjs";
import { ReactiveType } from "./type";
import { refArrayBuilder } from "./refHelper";

function createReactiveObject(obj: any, reactive: any) {
  return new Proxy(obj, {
    set(t, p, v) {
      const res = Reflect.set(t, p, v);

      if (typeof v === "object" && v.type === ReactiveType.Ref) {
        v.$sub.subscribe(() => {
          reactive.$sub.next(t);
        });
        return true;
      }

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

/**
 * Реактивная переменная
 * @param value - начальные данные
 * @returns ref переменную.
 */
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
    get(t: any, p: string) {
      if (type === "object") {
        if (Object.keys(reactive).includes(p)) return Reflect.get(t, p);
        const vl = t.value[p];
        if (vl && typeof vl === "object" && vl.type === ReactiveType.Ref) {
          // TODO тут теряется реактивность если объект был изначально
          if (typeof vl.value === "object" && !Array.isArray(vl.value)) {
            return vl;
          } else {
            vl.$sub.subscribe(() => {
              t.$sub.next(t);
            });

            return {
              type: ReactiveType.RefO,
              key: p,
              $sub: t.$sub,
              parent: t.value,
            };
          }
        }

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
