import { Line } from "../utils/line";
import { ref } from "../index";
import { ReactiveType } from "./type";
import { buffer } from "../utils/buffer";
import { getDeps } from "../utils/getDepsOfFunction";
import { unique } from "../utils/line/uniquaTransform";
import { scheduledWM } from "../utils/line/shedualWithOutMicrotask";

type Computed<T> = {
  type: ReactiveType;
  $sub: Line;
  value: T | null;
  _value?: unknown;
};

/*
[ ] - может вернуть jsx Node надо бы обрабатывать
[ ] - если не используется, не пересчитываем
[ ] - в линию проблемы получаются ( микротаска все портит
*/
function computedEffect<T>(func: () => T) {
  // const [deps, _acc] = getDeps(func);
  const pack = ref(null);

  const startObj: Computed<T> = {
    type: ReactiveType.Ref,
    $sub: pack.$sub as any,
    value: pack.value,
  };

  let firstCall = false;
  const obj: Computed<T> = new Proxy(startObj, {
    get(t, p) {
      if (p === "value" && buffer !== null) {
        buffer.push(t);
      }

      if (p === "value" && !firstCall) {
        firstCall = true;
        const [deps, _acc] = getDeps(func);

        reConnectDeps(deps);
        t.value = _acc;
        return _acc;
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
    const [deps, call] = getDeps(func);
    reConnectDeps(deps);
    obj._value = call;
  };

  let listFollow: any = null;
  function reConnectDeps(deps: any) {
    if (
      listFollow !== null ||
      (Array.isArray(listFollow) && listFollow.length > 0)
    ) {
      listFollow.forEach((e: any) => {
        e();
      });
    }

    if (deps.length > 0) {
      const sc = scheduledWM();
      listFollow = deps.map((dep: any) => {
        const func = unique(recall, dep.value ?? null);
        return dep.$sub.subscribe((value: any) => {
          sc(func, value);
        });
      });
    }
  }

  return obj as Computed<T>;
}

export { computedEffect };
