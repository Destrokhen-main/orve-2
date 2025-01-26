import { checkExistInstance } from "./helper";
import { getCurrentInstance } from "./getCurrentInstance";

export function context(name: string | symbol, data: any) {
  checkExistInstance();
  const instance = getCurrentInstance();
  if (instance) {
    if (instance.context) {
      instance.context[name] = data;
    } else {
      instance.context = { [name]: data };
    }
  }
}

export function inject(name: string | symbol, defaultValue: any = undefined) {
  checkExistInstance();
  const instance = getCurrentInstance();
  if (instance) {
    return instance.context[name] ?? defaultValue;
  }
}
