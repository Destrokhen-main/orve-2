import { returnType } from "../utils";
import { buffer } from "../utils/buffer";
import { Line } from "../utils/line";
import { refArrayBuilder } from "./refHelper";
import { ReactiveType } from "./type";

export function createReactiveObject(
  obj: Record<string, any>,
  reactive: RefImp<any>,
  options: OptionsRef,
): any {
  return new Proxy(obj, {
    get(t, p) {
      const value = Reflect.get(t, p);

      if (returnType(value) === "object") {
        return createReactiveObject(value, reactive, options);
      }

      if (returnType(value) === "array") {
        return refArrayBuilder(value, reactive, true, options);
      }

      return value;
    },
    set(t, p, v) {
      const res = Reflect.set(t, p, v);
      reactive.$sub?.next(reactive.value);
      return res;
    },
  });
}

type OptionsRef = {
  // Если необходимо в массивах следить только на изменением index то можно это поставить на false
  shallow?: boolean;
  __CTX_TEST__?: boolean;
};

class RefImp<T> {
  _value: T;
  _options: OptionsRef;
  $sub: Line | null;

  constructor(initValue: T, options: OptionsRef) {
    const initType = returnType(initValue);

    let _v: any = initValue;

    if (initType === "array") {
      _v = refArrayBuilder(initValue as T[], this, false, options);
    }
    if (initType === "object") {
      _v = createReactiveObject(
        initValue as Record<string, any>,
        this,
        options,
      );
    }

    this._value = _v;
    this._options = options;
    this.$sub = !options.__CTX_TEST__ ? new Line() : null;
  }

  get value() {
    if (buffer !== null) {
      buffer.push(this);
    }

    return this._value;
  }

  set value(newValue: T) {
    const newType = returnType(newValue);

    let _v: any = newValue;
    if (newType !== returnType(this._value)) {
      if (newType === "array") {
        _v = refArrayBuilder(newValue as T[], this, false, this._options);
      }
      if (newType === "object") {
        _v = createReactiveObject(
          newValue as Record<string, any>,
          this,
          this._options,
        );
      }
    }

    this._value = _v;
    this.$sub?.next(newValue);
  }

  draw(keyPath: string) {
    return {
      type: ReactiveType.RefO,
      keyPath: keyPath,
      parent: this as RefImp<T>,
    };
  }
}

function ref<T>(initValue: T, options: OptionsRef = {}) {
  return new RefImp<T>(initValue, options);
}

export { ref, RefImp, OptionsRef };
