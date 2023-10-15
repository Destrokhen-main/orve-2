import { BehaviorSubject, distinctUntilChanged } from "rxjs";
import { ReactiveType } from "./type";

function computed(func: () => unknown, dep: unknown[] = []) {
  if (typeof func !== "function") {
    console.error("ERROR func");
    return;
  }

  const firstCall = func();
  const obj = new Proxy(
    {
      type: ReactiveType.RefComputed,
      dep,
      func,
      value: firstCall,
      $sub: new BehaviorSubject(firstCall),
      $recall: function () {
        const res = this.func();
        this.value = res;
        this.$sub.next(res);
        return res;
      },
    },
    {
      set(t, p, v) {
        const res = Reflect.set(t, p, v);
        return res;
      },
      get(t, p) {
        if (p === Symbol.toPrimitive) {
          return () => t.value;
        }

        return Reflect.get(t, p);
      },
    },
  );
  if (Array.isArray(dep) && dep.length > 0) {
    dep.forEach((d: any) => {
      if (d.$sub !== undefined) {
        d.$sub
          .pipe(
            distinctUntilChanged((prevHigh: any, temp: any) => {
              return temp === prevHigh;
            }),
          )
          .subscribe(() => {
            obj.$recall();
          });
      }
    });
  }
  return obj;
}

export { computed };
