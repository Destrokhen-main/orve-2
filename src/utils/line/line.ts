import { Call } from "./type";

const MAX_TYPE = 2;
function buildSchedual() {
  let isWork = false;
  let value: any = null;

  return (deps: Set<Call>, v: unknown) => {
    value = v;

    if (!isWork) {
      isWork = true;
      queueMicrotask(() => {
        isWork = false;

        const typeObj: Record<number, ((val: any) => void)[]> = {};
        deps.forEach((e: any) => {
          if (!typeObj[e.type]) {
            typeObj[e.type] = [];
          }
          typeObj[e.type].push(e.f);
        });

        for (let i = 1; i !== MAX_TYPE + 1; i++) {
          const item = typeObj[i];
          if (item) {
            item.forEach((f: (val: any) => void) => {
              f(value);
            });
          }
        }
      });
    }
  };
}

export class Line {
  private _dep = new Set<Call>();
  private worker = buildSchedual();
  subscribe(call: Call) {
    this._dep.add(call);

    return () => {
      this._dep.delete(call);
    };
  }
  next(value: unknown) {
    this.worker(this._dep, value);
  }
  getAllDep() {
    return this._dep;
  }
}
