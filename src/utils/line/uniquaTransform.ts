import { isEqual } from "../isEqual";

function uniquae(func: (v: any) => any, startValue: any) {
  let _startValue = startValue;

  return (value: any) => {
    if (!isEqual(_startValue, value)) {
      _startValue = value;
      func(value);
    }
  };
}

export { uniquae };
