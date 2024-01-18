import { Call } from "./type";

export class Line {
  private _dep: Call[] = [];
  subscribe(call: Call) {
    this._dep.push(call);

    return () => {
      this._dep = this._dep.filter((item) => item !== call);
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
