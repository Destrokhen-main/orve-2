import { isEqual } from "lodash-es";
import { returnNewClone } from "../returnClone";

function unique(
  func: (v: any) => any,
  startValue: any,
  skipValue: string[] = [],
) {
  let _startValue = returnNewClone(startValue);

  return (value: any) => {
    if (skipValue.includes(value)) {
      func(value);
      return;
    }
    if (!isEqual(_startValue, value)) {
      _startValue = returnNewClone(value);
      func(value);
    }
  };
}

function uniqueWithPast(func: (n: any, o: any) => any, startValue: any) {
  let _startValue = returnNewClone(startValue);

  return (value: any) => {
    if (!isEqual(_startValue, value)) {
      func(value, _startValue);
      _startValue = returnNewClone(value);
    }
  };
}

export { unique, uniqueWithPast };
