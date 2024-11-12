import { Line } from "../utils/line";
// import { ReactiveType } from "./type";
// import { returnNewClone } from "../utils/returnClone";
// import { isEqual } from "lodash-es";
import { uniqueWithPast, unique } from "../utils/line/uniquaTransform";
import { getDeps } from "../utils/getDepsOfFunction";

interface Dep {
  [T: string]: any;
  $sub: Line;
}

type Options = {
  immediate?: boolean;
  once?: boolean;
};

/*
[ ] - callback на оключение орёт что переменная юзаеться до инициализации. плохо (
*/
/**
 * Смотритель для реактивной переменной
 * @param func - watcher - что будет вызываться при срабатывания watch
 * @param dep - реактивные переменные, для которых будет применять функция watch
 * @returns  либо одно или массив функций, для отключения watch
 */
function watch(
  func: (n?: any, o?: any) => void,
  dep: Dep,
  options: Options | null = null,
) {
  if (typeof dep !== "object" || dep === null) {
    console.warn("[watch] - Dep is bad");
    return false;
  }

  const d = dep as Dep;

  if (d.$sub === undefined) {
    return false;
  }
  const cur: any = d.$sub.subscribe({
    type: 2,
    f: uniqueWithPast((newV: any, oldV: any) => {
      func(newV, oldV);
    }, d.value ?? null),
  });

  if (options && options.immediate) {
    func(undefined, undefined);
  }

  if (options && options.once) {
    cur();
  }

  return () => cur();
}

function watchEffect(func: () => void) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deps, _] = getDeps(func);

  const completeAll: any = [];

  deps.forEach((dep) => {
    const cur: any = dep.$sub.subscribe(
      unique(() => {
        func();
      }, dep.value ?? null),
    );
    completeAll.push(cur);
  });

  return () => {
    completeAll.forEach((e: any) => e());
  };
}

export { watch, watchEffect };
