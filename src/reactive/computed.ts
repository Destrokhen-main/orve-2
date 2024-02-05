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
import { Line } from "../utils/line";
import { ref } from "./ref";
import { ReactiveType } from "./type";
import { logger } from "../utils/logger";
import { isEqual } from "../utils/isEqual";
import { returnNewClone } from "../utils/returnClone";
import { unique } from "../utils/line/uniquaTransform";
import { buffer } from "../utils/buffer";

type Computed<T> = {
  type: ReactiveType;
  $sub: Line;
  value: T;
  _value?: unknown;
};

function computed<T>(func: () => T, deps: any[]) {
  const acc = func();
  const pack = ref(acc);

  const startObj: Computed<T> = {
    type: ReactiveType.Ref,
    $sub: pack.$sub as any,
    value: pack.value,
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

  const recall = () => {
    obj._value = func();
  };

  if (deps.length > 0) {
    deps.forEach((dep) => {
      // let lastValue: any;
      // if (dep.type === ReactiveType.RefO) {
      //   lastValue = returnNewClone(dep.parent[dep.key]);
      // }
      dep.$sub.subscribe(
        unique(recall, dep.value ?? null),
      );
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
    get(t, p) {
      if (p === "value" && buffer !== null) {
        buffer.push(t);
      }

      return Reflect.get(t, p);
    },
  });
}

export { computed };
