import { RefA } from "./ref";

export enum EtypeRefRequest {
  insert = "Insert",
  delete = "Delete",
  insertByIndex = "InsertByIndex",
  edit = "Edit"
}

export enum Dir {
  right = "Right",
  left = "Left"
}

export function refArrayBuilder(arr: any[], obj: RefA) {
  return new Proxy(arr, {
    get(t: any[], p: any) {
      const val = t[p];
      if (typeof val === "function") {
        if (["push", "unshift"].includes(p)) {
          if (p === "push") {
            return function(...args: any[]) {
              if (args.length > 0) {
                obj.$sub.next({
                  type: EtypeRefRequest.insert,
                  dir: Dir.right,
                  value: args,
                });
              }

              return Array.prototype[p].apply(t, args);
            };
          } else {
            // unshift
            return function(...args: any[]) {
              if (args.length > 0) {
                obj.$sub.next({
                  type: EtypeRefRequest.insert,
                  dir: Dir.left,
                  value: args
                });
              }

              return Array.prototype[p].apply(t, args);
            };
          }
        }
        if (["shift"].includes(p)) {
          return function() {
            const before = t.length;
            const s = Array.prototype[p].apply(t);

            if (before > 0) {
              obj.$sub.next({
                type: EtypeRefRequest.delete,
                dir: Dir.left
              });
            }

            return s;
          };
        }
        if (["pop"].includes(p)) {
          return function() {
            const before = t.length;
            const s = Array.prototype[p].apply(t);

            if (before > 0) {
              obj.$sub.next({
                type: EtypeRefRequest.delete,
                dir: Dir.right,
                needCheck: false
              });
            }
            return s;
          };
        }
        if (["splice"].includes(p)) {
          return function(A: string, B: string, ...args: any[]) {
            const before = t.length;
            const s = Array.prototype[p].apply(t, [A,B, ...args]);

            const a = parseInt(A, 10);
            const b = parseInt(B, 10);

            if (before > 0) {
              if (b !== 0) {
                obj.$sub.next({
                  type: EtypeRefRequest.delete,
                  start: a,
                  count: b,
                  ...(args.length > 0 ? { needCheck : false } : {})
                });

                if (args.length > 0) {
                  obj.$sub.next({
                    type: EtypeRefRequest.insertByIndex,
                    start: a,
                    value: args
                  });
                }
                return;
              }
              
              if(b === 0 && args.length > 0) {
                obj.$sub.next({
                  type: EtypeRefRequest.insertByIndex,
                  start: a,
                  value: args
                });
                return;
              }
            }

            if (args.length > 0) {
              obj.$sub.next({
                type: EtypeRefRequest.insert,
                dir: Dir.right,
                value: args
              });
            }
            
            return s;
          };
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
          type: EtypeRefRequest.edit,
          key: p,
          value: v
        });
      } else {
        // addNew item;
      }

      return s;
    }
  });
}