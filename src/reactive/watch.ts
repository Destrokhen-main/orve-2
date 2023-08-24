import { BehaviorSubject, pairwise } from "rxjs";

interface Dep {
  [T: string]: any;
  $sub: BehaviorSubject<any>;
}

/**
 * Смотритель для реактивной переменной
 * @param func - watcher - что будет вызываться при срабатывания watch
 * @param dep - реактивные переменные, для которых будет применять функция watch
 * @returns  либо одно или массив функций, для отключения watch
 */
function watch(func: (n: any, o: any) => void, dep: Dep | Dep[]) {
  if (typeof dep !== "object" || dep === null) {
    console.warn("Dep is bad");
    return false;
  }

  if (Array.isArray(dep) && dep.length > 0) {
    const depArrayDisconnect = [];

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
      console.warn("One or any dep is not subscribe");
    }

    return depArrayDisconnect;
  } else {
    const d = dep as Dep;

    if (d.$sub === undefined) {
      return false;
    }

    const cur: any = d.$sub
      .pipe(pairwise())
      .subscribe(([b, c]: any) => func(c, b));
    return () => cur.complete();
  }
}

export { watch };
