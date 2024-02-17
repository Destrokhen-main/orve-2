import { Call } from "./type";

export class Line {
  private _dep = new Set<Call>();
  subscribe(call: Call) {
    this._dep.add(call);

    return () => {
      this._dep.delete(call);
    };
  }
  next(value: unknown) {
    this._dep.forEach((dep) => {
      dep(value);
    });
  }
  getAllDep() {
    return this._dep;
  }
}
