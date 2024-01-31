import { Subject } from "rxjs";
import { ref } from "../index";
import { ReactiveType } from "./type";
import { buffer, updateBuffer } from "../utils/buffer";
import { returnNewClone } from "../utils/returnClone";
import { isEqual } from "../utils/isEqual";

type Computed<T> = {
  type: ReactiveType;
  $sub: Subject<T>;
  value: T;
  _value?: unknown;
};

function effect<T>(func: () => T) {
  const deps: any = [];
  updateBuffer(deps);
  let acc = func();
  updateBuffer(null);

  const pack = ref(acc);

  const startObj: Computed<T> = {
    type: ReactiveType.Ref,
    $sub: pack.$sub as any,
    value: pack.value,
  };

  const obj = new Proxy(startObj, {
    get(t, p) {
      if (p === "value" && buffer !== null) {
        buffer.push(t);
      }

      return Reflect.get(t, p);
    },
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
    const deps: any = [];
    updateBuffer(deps);
    const call = func();
    updateBuffer(null);
    if (!isEqual(acc, call)) {
      reConnectDeps(deps);
      acc = call;
      obj._value = call;
    }
  };

  let listFollow: any = null;
  function reConnectDeps(deps: any) {
    if (
      listFollow !== null ||
      (Array.isArray(listFollow) && listFollow.length > 0)
    ) {
      listFollow.forEach((e: any) => {
        e.complete();
      });
    }

    if (deps.length > 0) {
      listFollow = deps.map((dep: any) => {
        let lastValue: any;
        if (dep.type === ReactiveType.RefO) {
          lastValue = returnNewClone(dep.parent[dep.key]);
        }
        let f = true;
        return dep.$sub.subscribe({
          next() {
            if (!f) {
              recall();
            } else {
              f = false;
            }
            // if (dep.type === ReactiveType.RefO) {
            //   if (!isEqual(dep.parent[dep.key], lastValue)) {
            //     recall();
            //     lastValue = returnNewClone(dep.parent[dep.key]);
            //   }
            // } else {
            //   recall();
            // }
          },
        });
      });
    }
  }

  reConnectDeps(deps);
  return obj;
}

export { effect };
