import { genUID } from "../helper";
import { buffer } from "../utils/buffer";
import { getDeps } from "../utils/getDepsOfFunction";
import { unique } from "../utils/line/uniquaTransform";
import { logger } from "../utils/logger";
import { ref, RefImp } from "./ref";
import { ReactiveType } from "./type";

function getDepsAndValue<T>(_deps: Array<any> | null, caller: () => T) {
  if (_deps !== null) {
    return [_deps, caller()];
  } else {
    const [deps, _acc] = getDeps(caller);
    return [deps, _acc];
  }
}

class ComputedImp<T> {
  id = genUID();
  callback: () => T;
  reffer: RefImp<T | null>;
  $sub: any;
  _value: T | null = null;
  _firstCall = false;
  _deps: any[] | null = null;
  listFollower: any[] = [];
  type = ReactiveType.Ref;

  constructor(callback: () => T, deps: any[] | null = null) {
    this.callback = callback;
    this.reffer = ref<T | null>(null);
    this.$sub = this.reffer.$sub;
    if (deps) {
      this._deps = deps;
    }
  }

  get value() {
    if (buffer !== null) {
      buffer.push(this);
    }

    if (!this._firstCall) {
      this._firstCall = true;

      const [_deps, _acc] = getDepsAndValue(this._deps, this.callback);

      this.depsWorker(_deps);
      this._value = _acc;
      return _acc;
    }

    return this._value;
  }

  depsWorker(deps: any[]) {
    if (this.listFollower.length === 0 && deps.length > 0) {
      this.listFollower = deps.map((dep) => {
        const func = unique(() => this.recall(), dep.value ?? null);
        return {
          dep,
          remove: dep.$sub.subscribe({
            type: 2,
            f: func,
          }),
        };
      });
    }

    if (this.listFollower.length > 0 && deps.length > 0) {
      const depsMap: Record<string, any> = {};

      deps.forEach((dep) => {
        depsMap[dep.id] = dep;
      });

      const listFollowerMap: Record<string, any> = {};

      this.listFollower.forEach((dep) => {
        listFollowerMap[dep.dep.id] = dep;
      });

      // Отписался из листа те которых нет в новом
      this.listFollower.forEach((dep) => {
        if (!depsMap[dep.dep.id]) {
          dep.remove();
          dep.dep = null;
        }
      });

      this.listFollower = this.listFollower.filter((dep) => dep.dep !== null);

      deps.forEach((dep) => {
        if (!listFollowerMap[dep.id]) {
          const func = unique(() => this.recall(), dep.value ?? null);
          this.listFollower.push({
            dep,
            remove: dep.$sub.subscribe({
              type: 2,
              f: func,
            }),
          });
        }
      });
    }
  }

  recall() {
    const [_deps, call] = getDepsAndValue(this._deps, this.callback);
    this.depsWorker(_deps);
    this._value = call;
    this.$sub.next(this._value);
  }

  set value(_) {
    logger("warn", "%c[computed]%c Нельзя перезаписывать значение computed");
  }
}

function computed<T>(callback: () => T, deps: any[] | null = null) {
  return new ComputedImp(callback, deps);
}

export { computed, ComputedImp };
