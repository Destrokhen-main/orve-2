/**
 * Функция помогающая правильно отрисовывать реактивные массивы
 * @param arr - массив
 * @param obj - реактивная переменная массива
 * @returns Реактивную переменную массива
 */
export function refArrayBuilder(arr: any[], obj: any) {
  return new Proxy(arr, {
    get(t: any[], p: any) {
      const val = t[p];
      if (typeof val === "function") {
        if (["push", "unshift"].includes(p)) {
          if (p === "push") {
            return function (...args: any[]) {
              const result = Array.prototype[p].apply(t, args);
              obj.$sub.next(t);
              return result;
            };
          } else {
            // unshift
            return function (...args: any[]) {
              const result = Array.prototype[p].apply(t, args);
              obj.$sub.next(t);
              return result;
            };
          }
        }
        if (["shift"].includes(p)) {
          return function () {
            const result = Array.prototype[p].apply(t);
            obj.$sub.next(t);
            return result;
          };
        }
        if (["pop"].includes(p)) {
          return function () {
            const result = Array.prototype[p].apply(t);
            obj.$sub.next(t);
            return result;
          };
        }
        if (["splice"].includes(p)) {
          return function (A: string, B: string, ...args: any[]) {
            const result = Array.prototype[p].apply(t, [A, B, ...args]);
            obj.$sub.next(t);
            return result;
          };
        }
        return val.bind(t);
      }
      return Reflect.get(t, p);
    },
    set(t: any[], p: string, v: any) {
      const s = Reflect.set(t, p, v);
      const num = parseInt(p, 10);
      if (!Number.isNaN(num)) {
        t[num] = v;
        obj.$sub.next(t);
      }

      return s;
    },
  });
}
