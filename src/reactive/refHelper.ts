import { createReactiveObject, returnType } from "./ref";

/**
 * Функция помогающая правильно отрисовывать реактивные массивы
 * @param arr - массив
 * @param obj - реактивная переменная массива
 * @returns Реактивную переменную массива
 */
export function refArrayBuilder<T>(arr: T[], obj: any, isObj: boolean = false): T[] {
  // TODO экспериментальный код
  const mutableArray = arr.map((item) => {
    if (returnType(item) === "object") {
      return createReactiveObject(item, obj);
    }
    if (returnType(item) === "array") {
      return refArrayBuilder(item as T[], obj, true); // TODO хз тотально
    }
    return item;
  });

  const pr = new Proxy(mutableArray, {
    get(t: any[], p: any) {
      const val = t[p];
      if (typeof val === "function") {
        if (["push", "unshift"].includes(p)) {
          if (p === "push") {
            return function (...args: any[]) {
              const result = Array.prototype[p].apply(t, args);
              obj.$sub.next(isObj ? obj.value : t);
              return result;
            };
          } else {
            // unshift
            return function (...args: any[]) {
              const result = Array.prototype[p].apply(t, args);
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

      const s = Reflect.set(t, p, v);
      const num = parseInt(p, 10);
      if (!Number.isNaN(num)) {
        t[num] = v;
        obj.$sub.next(isObj ? obj.value : t);
      }

      return s;
    },
  });

  return pr;
}
