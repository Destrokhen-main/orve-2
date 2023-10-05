import { BehaviorSubject } from "rxjs";
import { ReactiveType } from "./type";

function computed(func: () => unknown, dep: unknown[] = []) {
  if (typeof func !== "function") {
    console.error("ERROR func");
    return;
  }

  const firstCall = func();
  const obj = new Proxy({
    type: ReactiveType.RefComputed,
    dep,
    func,
    value: firstCall,
    lastCall: firstCall,
    $sub: new BehaviorSubject(firstCall),
  }, {
    set(t, p, v) {
      const res = Reflect.set(t, p, v);
      if (p === "value") {
        t.$sub.next(v);
      }
      return res;
    },
    get(t, p) {
      if (p === Symbol.toPrimitive) {
        return () => t.value;
      }

      return Reflect.get(t, p);
    }
  });
  return obj;
}

export { computed };