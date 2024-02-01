import { Line } from "../utils/line";
import { ReactiveType } from "./type";
import { returnNewClone } from "../utils/returnClone";
import { isEqual } from "../utils/isEqual";

interface Dep {
  [T: string]: any;
  $sub: Line;
}

/**
 * Смотритель для реактивной переменной
 * @param func - watcher - что будет вызываться при срабатывания watch
 * @param dep - реактивные переменные, для которых будет применять функция watch
 * @returns  либо одно или массив функций, для отключения watch
 */
function watch(func: (n: any, o: any) => void, dep: Dep | Dep[]) {
  if (typeof dep !== "object" || dep === null) {
    console.warn("[watch] - Dep is bad");
    return false;
  }

  if (Array.isArray(dep) && dep.length > 0) {
    const depArrayDisconnect = [];

    let showD = false;

    for (let i = 0; i !== dep.length; i++) {
      if (dep[i].$sub !== undefined) {
        let lastValue: any = null;
        const cur: any = dep[i].$sub.subscribe((_value: any) => {
          let value = _value;
          if (dep[i].type === ReactiveType.RefO) {
            const ti = dep[i] as any;
            value = ti.parent[ti.key];
          }
          if (lastValue === null) {
            lastValue = returnNewClone(value);
          } else if (!isEqual(value, lastValue)) {
            func(value, lastValue);
            lastValue = returnNewClone(value);
          }
        });
        depArrayDisconnect.push(() => cur.complete());
      } else {
        showD = true;
      }
    }

    if (showD) {
      console.warn("[watch] - One or any dep is not subscribe");
    }

    return depArrayDisconnect;
  } else {
    const d = dep as Dep;

    if (d.$sub === undefined) {
      return false;
    }
    let lastValue: any = null;
    const cur: any = d.$sub.subscribe((_value: any) => {
      let value = _value;
      if (d.type === ReactiveType.RefO) {
        const i = d as any;
        value = i.parent[i.key];
      }
      if (lastValue === null) {
        lastValue = returnNewClone(value);
      } else if (!isEqual(value, lastValue)) {
        func(value, lastValue);
        lastValue = returnNewClone(value);
      }
    });
    return () => cur.complete();
  }
}

export { watch };
