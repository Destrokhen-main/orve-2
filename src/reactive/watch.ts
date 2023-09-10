import { BehaviorSubject, pairwise } from "rxjs";
import { ReactiveType } from "./type";
import { EtypeRefRequest } from "./refHelper";

interface Dep {
  [T: string]: unknown;
  $sub: BehaviorSubject<any>;
}

type callbackWacther = () => void;

/**
 * Смотритель для реактивной переменной
 * @param func - watcher - что будет вызываться при срабатывания watch
 * @param dep - реактивные переменные, для которых будет применять функция watch
 * @returns  либо одно или массив функций, для отключения watch
 */
function watch(func: (n: unknown, o: unknown) => void, dep: Dep | Dep[]) {
  if (typeof dep !== "object" || dep === null) {
    console.warn("[watch] - Dep is bad");
    return false;
  }

  if (Array.isArray(dep) && dep.length > 0) {
    const depArrayDisconnect: callbackWacther[] = [];

    let showD = false;

    for (let i = 0; i !== dep.length; i++) {
      if (dep[i].$sub !== undefined) {
        const cur: any = dep[i].$sub
          .pipe(pairwise())
          .subscribe(([b, c]: any) => func(c, b));
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
      console.warn("[watch] - One or any dep is not subscribe");
      return false;
    }

    const cur: any = d.$sub
      .pipe(pairwise())
      .subscribe(([b, c]: [unknown, unknown]) => {
        let prev = b;
        const next = c;

        if (d && typeof d === "object" && d.type === ReactiveType.RefA) {
          if (
            typeof next === "object" &&
            (next as Record<string, unknown>).type === EtypeRefRequest.delete
          )
            return;
          if (
            prev &&
            typeof prev === "object" &&
            (prev as Record<string, unknown>).type === EtypeRefRequest.delete
          ) {
            prev = null;
          }
        }

        return func(next, prev);
      });
    return () => cur.complete();
  }
}

export { watch };
