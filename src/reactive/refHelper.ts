import { returnType } from "../utils";
import { logger } from "../utils/logger";
import { createReactiveObject } from "./ref";
import { OptionsRef } from "./ref";

function modifyAr<T>(arr: T[], obj: any, options: OptionsRef = {}) {
  return arr.map((item) => {
    if (!options.shallow) {
      if (returnType(item) === "object") {
        return createReactiveObject(item as any, obj, options);
      }
      if (returnType(item) === "array") {
        return refArrayBuilder(item as T[], obj, true, options); // TODO хз тотально
      }
    }
    return item;
  });
}

/**
 * Функция помогающая правильно отрисовывать реактивные массивы
 * @param arr - массив
 * @param obj - реактивная переменная массива
 * @returns Реактивную переменную массива
 */
export function refArrayBuilder<T>(
  arr: T[],
  obj: any,
  isObj: boolean = false,
  options: OptionsRef = {},
): T[] {
  // TODO экспериментальный код
  let mutableArray;

  if (!options.shallow) {
    mutableArray = modifyAr(arr, obj, options);
  } else {
    mutableArray = arr;
  }

  const pr = new Proxy(mutableArray, {
    get(t: any[], p: any) {
      const val = t[p];
      if (typeof val === "function") {
        if (["push", "unshift"].includes(p)) {
          if (p === "push") {
            return function (...args: any[]) {
              const ar = modifyAr(args, obj, options);
              const result = Array.prototype[p].apply(t, ar);

              obj.$sub.next(isObj ? obj.value : t);
              return result;
            };
          } else {
            // unshift
            return function (...args: any[]) {
              const ar = modifyAr(args, obj, options);

              const result = Array.prototype[p].apply(t, ar);
              obj.$sub.next(isObj ? obj.value : t);
              return result;
            };
          }
        }
        if (["shift"].includes(p)) {
          return function () {
            const result = Array.prototype[p].apply(t);
            obj.$sub.next(isObj ? obj.value : t);
            return result;
          };
        }
        if (["pop"].includes(p)) {
          return function () {
            const result = Array.prototype[p].apply(t);
            obj.$sub.next(isObj ? obj.value : t);
            return result;
          };
        }
        if (["splice"].includes(p)) {
          return function (A: string, B: string, ...args: any[]) {
            const result = Array.prototype[p].apply(t, [A, B, ...args]);
            obj.$sub.next(isObj ? obj.value : t);
            return result;
          };
        }
        return val.bind(t);
      }
      return Reflect.get(t, p);
    },
    set(t: T[], p: string, v: any) {
      if (p === "_v") {
        t[parseInt(p)] = v;
        return true;
      }

      const num = parseInt(p, 10);

      if (!Number.isNaN(num) && num > t.length) {
        logger(
          "warn",
          "%c[ref]%c - index больше длины массива, лучше использовать push или unshift",
        );
        return true;
      }

      const s = Reflect.set(t, p, v);
      if (!Number.isNaN(num)) {
        if (!options.shallow) {
          const m = modifyAr([v], obj, options);
          t[num] = m[0];
        } else {
          t[num] = v;
        }
        obj.$sub.next(isObj ? obj.value : t);
      }

      return s;
    },
  });

  return pr;
}

export function getValueAtPath(obj: Record<string, any>, path: string): any {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}
