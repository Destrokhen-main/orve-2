import { compareObjects } from "../mounter/helper";
import { Call } from "./type";

const areArraysEqual = (firstArray: any[], secondArray: any[]) => {
  if (
    firstArray.length === secondArray.length &&
    firstArray.every((element, index) => element === secondArray[index])
  ) {
    return true;
  }
  return false;
};

export class ULine {
  private _dep: Call[] = [];
  private _lastValue: any = null;
  subscribe(call: Call) {
    this._dep.push(call);

    return () => {
      this._dep = this._dep.filter((item) => item !== call);
    };
  }
  next(value: any) {
    if (
      typeof value !== typeof this._lastValue ||
      (Array.isArray(value) &&
        Array.isArray(this._lastValue) &&
        areArraysEqual(value, this._lastValue)) ||
      (Array.isArray(value) && !Array.isArray(value)) ||
      (typeof value === "object" &&
        value !== null &&
        !compareObjects(value, this._lastValue)) ||
      (typeof value === "function" &&
        this._lastValue.toString() !== value.toString()) ||
      value !== this._lastValue
    ) {
      this._lastValue = value;
      this._dep.forEach((dep) => {
        dep(value);
      });
    }
  }
}
