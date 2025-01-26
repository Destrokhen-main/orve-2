import { GlobalInstance, emptyGlobalInstance } from "../instance";
import { AVAILABLE_HOOKS } from "./composables";

export function generateInstace(parent: any = null) {
  const instance = {
    el: null,
    context: {},
    parent: null,
  };

  if (parent) {
    instance.parent = parent.instance;
    if (
      parent.instance.context &&
      Object.keys(parent.instance.context).length > 0
    ) {
      instance.context = { ...instance.context, ...parent.instance.context };
    }
  }

  if (GlobalInstance) {
    const context: Record<string, any> = {};
    Object.keys(GlobalInstance).forEach((key) => {
      if (AVAILABLE_HOOKS.includes(key)) {
        (instance as any)[key] = GlobalInstance![key];
      } else {
        context[key] = GlobalInstance![key];
      }
    });

    instance.context = context;
    emptyGlobalInstance();
  }

  return instance;
}
