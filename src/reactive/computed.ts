// import { BehaviorSubject, distinctUntilChanged } from "rxjs";
// import { ReactiveType } from "./type";

// function computed(func: () => unknown, dep: unknown[] = []) {
//   if (typeof func !== "function") {
//     console.error("Первым параметром ожидается функция");
//     return;
//   }

//   if (dep && !Array.isArray(dep)) {
//     dep = [dep];
//   }

//   const firstCall = func();
//   const obj = new Proxy(
//     {
//       type: ReactiveType.RefComputed,
//       dep,
//       func,
//       value: firstCall,
//       $sub: new BehaviorSubject(firstCall),
//       $recall: function () {
//         const res = this.func();
//         this.value = res;
//         this.$sub.next(res);
//         return res;
//       },
//     },
//     {
//       get(t, p) {
//         if (p === Symbol.toPrimitive) {
//           return () => t.value;
//         }

//         return Reflect.get(t, p);
//       },
//     },
//   );
//   if (Array.isArray(dep) && dep.length > 0) {
//     dep.forEach((d: any) => {
//       if (d.$sub !== undefined) {
//         d.$sub
//           .pipe(
//             distinctUntilChanged((prevHigh: any, temp: any) => {
//               return temp === prevHigh;
//             }),
//           )
//           .subscribe(() => {
//             obj.$recall();
//           });
//       }
//     });
//   }
//   return obj;
// }

// Запретить изменять ref сверху.
import { Subject } from "rxjs";
import { ref } from "./ref";
import { ReactiveType } from "./type";
import { logger } from "../utils/logger";
import { isEqual } from "../utils/isEqual";
function computed<T>(func: () => T, deps: any[]) {
  let acc = func();
  const pack = ref(acc);

  const startObj: {
    type: ReactiveType;
    $sub: Subject<T>;
    value: T;
    _value: unknown;
  } = {
    type: ReactiveType.Ref,
    $sub: pack.$sub,
    value: pack.value,
    _value: undefined,
  };

  const obj = new Proxy(startObj, {
    set(t, p, v) {
      if (p === "_value") {
        t.value = v;
        pack.value = v;
        return true;
      }
      return false;
    },
  });

  if (deps.length > 0) {
    deps.forEach((dep) => {
      dep.$sub.subscribe({
        next() {
          const call = func();
          if (!isEqual(acc, call)) {
            acc = call;
            (obj as any)._value = call;
          }
        },
      });
    });
  }

  return new Proxy(obj, {
    set(t, p, v) {
      if (p === "_value") {
        t.value = v;
        pack.value = v;
        return true;
      }

      logger("warn", "%c[computed]%c Нельзя перезаписывать значение computed");
      return false;
    },
  });
}

export { computed };
