import { Call } from "./type";

export class Line {
  private _dep: Call[] = [];
  subscribe(call: Call) {
    this._dep.push(call);

    return () => {
      this._dep = this._dep.filter((item) => item !== call);
    };
  }
  next(value: any) {
    this._dep.forEach((dep) => {
      dep(value);
    });
  }
}
