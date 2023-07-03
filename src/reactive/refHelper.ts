import { RefA } from "./ref";

export function refArrayBuilder(arr: any[], obj: RefA) {
  return new Proxy(arr, {
    get(t: any[], p: any) {
      const val = t[p];
      if (typeof val === "function") {
        if (['push', 'unshift'].includes(p)) {
          if (p === "push") {
            return function(...args: any[]) {
              if (args.length > 0) {
                obj.$sub.next({
                  type: "insert",
                  dir: "right",
                  value: args
                });
              }

              return Array.prototype[p].apply(t, args);
            }
          } else {
            // unshift
            return function(...args: any[]) {
              if (args.length > 0) {
                obj.$sub.next({
                  type: "insert",
                  dir: "left",
                  value: args
                });
              }

              return Array.prototype[p].apply(t, args);
            }
          }
        }
        if (['shift'].includes(p)) {
          return function() {
            const before = t.length;
            const s = Array.prototype[p].apply(t);

            if (before > 0) {
              obj.$sub.next({
                type: "delete",
                dir: "left"
              })
            }

            return s;
          }
        }
        if (['pop'].includes(p)) {
          return function() {
            const before = t.length;
            const s = Array.prototype[p].apply(t);

            if (before > 0) {
              obj.$sub.next({
                type: "delete",
                dir: "right"
              })
            }
            return s;
          }
        }
        if (['splice'].includes(p)) {
          return function(a: number, b: number, ...args: any[]) {
            const before = t.length;
            const s = Array.prototype[p].apply(t, [a,b, ...args]);

            if (before > 0) {
              if (b !== 0) {
                obj.$sub.next({
                  type: "delete",
                  start: a,
                  count: b
                })
              }
              
              if(b === 0 && args.length > 0) {
                obj.$sub.next({
                  type: "insertByIndex",
                  start: a,
                  value: args
                });
              }
            }

            if (args.length > 0) {
              obj.$sub.next({
                type: "insert",
                dir: "right",
                value: args
              });
            }
            
            return s;
          }
        }
        return val.bind(t);
      }
      return Reflect.get(t, p);
    },
    set(t: any[], p: string, v: any) {
      const s = Reflect.set(t, p, v);
      const num = parseInt(p, 10);

      if (!Number.isNaN(num) && num < t.length) {
        obj.$sub.next({
          type: "edit",
          key: p,
          value: v
        })
      } else {
        // addNew item;
      }

      return s;
    }
  });
}