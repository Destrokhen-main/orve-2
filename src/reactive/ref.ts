import { Line } from "../utils/line";
import { ReactiveType } from "./type";
import { refArrayBuilder } from "./refHelper";
import { buffer } from "../utils/buffer";
import { unique } from "../utils/line/uniquaTransform";

export function createReactiveObject(
  obj: any,
  reactive: any,
  options: OptionsRef,
) {
  const keys = Object.keys(obj);

  keys.forEach((key: string) => {
    const type = returnType(obj[key]);

    if (type === "array") {
      obj[key] = refArrayBuilder(obj[key], reactive, true, options);
    }
  });

  return new Proxy(obj, {
    set(t, p, v) {
      const res = Reflect.set(t, p, v);
      reactive.$sub.next(reactive.value);
      return res;
    },
    get(t, p) {
      return Reflect.get(t, p);
    },
  });
}

export function returnType(v: unknown): string {
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

export type OptionsRef = {
  // Если необходимо в массивах следить только на изменением index то можно это поставить на false
  shallow?: boolean;
};

/*
[ ] - объекты всегда обладают погружением. А так не всегда надо
*/

/**
 * Реактивная переменная
 * @param value - начальные данные
 * @returns ref переменную.
 */
function ref<T>(value: T, options?: OptionsRef) {
  const context = this ?? {};

  const opt = options || {};

  const subject = new Line();

  const reactive: Ref<T> = {
    type: ReactiveType.Ref,
    value,
    $sub: !context.__CTX_TEST__ ? subject : {},
  };

  reactive.value = Array.isArray(value)
    ? refArrayBuilder(value, reactive, false, opt)
    : value && typeof value === "object"
    ? createReactiveObject(value, reactive, opt)
    : value;

  let type = returnType(value);
  const reactiveObject: Ref<T> = new Proxy(reactive, {
    set(t: Ref<T>, p, value) {
      if (p === "value") {
        const newType = returnType(value);
        if (newType !== type) {
          type = newType;
          if (newType === "array" || Array.isArray(value)) {
            t.value = refArrayBuilder(value, reactive, false, options) as any;
          } else if (value && typeof value === "object") {
            t.value = createReactiveObject(value, reactive, opt);
          } else {
            t.value = value;
          }
        } else {
          if (Array.isArray(value)) {
            t.value = refArrayBuilder(value, reactive, false, options) as any;
          } else if (value && typeof value === "object") {
            t.value = createReactiveObject(value, reactive, opt);
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
      const res = Reflect.get(t, p);
      if (p === "value" && buffer !== null) {
        buffer.push(t);
      }
      if (type === "object") {
        if (Object.keys(reactive).includes(p)) return Reflect.get(t, p);
        const value = t.value[p];
        if (returnType(value) === "object" && value.type === ReactiveType.Ref) {
          // TODO мб тут надо проверку на много пересчётов
          value.$sub.subscribe(
            unique(() => {
              const item = t.value[p];
              t.value[p] = item;
            }, t.value[p].value),
          );
          return value;
        }

        const returnObj = {
          type: ReactiveType.RefO,
          key: p,
          $sub: t.$sub,
          parent: t.value,
        };

        return returnObj;
      }
      return res;
    },
  });

  return reactiveObject;
}

export { ref, Ref };
