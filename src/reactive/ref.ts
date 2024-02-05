import { Line } from "../utils/line";
import { ReactiveType } from "./type";
import { refArrayBuilder } from "./refHelper";
import { buffer } from "../utils/buffer";

function createReactiveObject(obj: any, reactive: any) {
  const keys = Object.keys(obj);

  keys.forEach((key: string) => {
    const type = returnType(obj[key]);

    if (type === "object" && obj[key].type === undefined) {
      obj[key] = createReactiveObject(obj[key], reactive);
    } else if (type === "array") {
      obj[key] = refArrayBuilder(obj[key], reactive, true);
    }
  });

  return new Proxy(obj, {
    set(t, p, v) {
      const res = Reflect.set(t, p, v);
      reactive.$sub.next(reactive.value);
      return res;
    },
    get(t, p) {
      const type = returnType(t[p]);

      return Reflect.get(t, p);
    }
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
  $sub: Line | Record<string, any>;
};

/**
 * Реактивная переменная
 * @param value - начальные данные
 * @returns ref переменную.
 */
function ref<T>(value: T) {
  const context = this ?? {};

  const subject = new Line();

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
      if (p === "value" && buffer !== null) {
        buffer.push(t);
      }
      if (type === "object") {
        if (Object.keys(reactive).includes(p)) return Reflect.get(t, p);

        const returnObj = {
          type: ReactiveType.RefO,
          key: p,
          $sub: t.$sub,
          parent: t.value,
        };

        return returnObj;
      }
      return Reflect.get(t, p);
    },
  });

  return reactiveObject;
}

export { ref, Ref };
