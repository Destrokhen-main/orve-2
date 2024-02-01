import { isEqual } from "../isEqual";
import { Call } from "./type";

export class ULine {
  private _dep: Call[] = [];
  private _lastValue: any = null;

  constructor(initValue?: any) {
    if (initValue) this._lastValue = initValue;
  }

  subscribe(call: Call) {
    this._dep.push(call);

    return () => {
      this._dep = this._dep.filter((item) => item !== call);
    };
  }
  next(value: any) {
    if (!isEqual(value, this._lastValue)) {
      this._lastValue = value;
      this._dep.forEach((dep) => {
        dep(value);
      });
    }
  }
  getAllDep() {
    return this._dep;
  }
}
