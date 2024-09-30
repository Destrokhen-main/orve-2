import { Call } from "./type";

function buildSchedual() {
  let isWork = false;
  let value: any = null;

  return (deps: Set<Call>, v: unknown) => {
    value = v;

    if (!isWork) {
      isWork = true;
      queueMicrotask(() => {
        isWork = false;
        deps.forEach((dep) => {
          dep(value);
        });
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
