import { GlobalInstance, isStepCreateApp } from "../instance";

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

  if (!isStepCreateApp && GlobalInstance) {
    instance.context = {
      ...instance.context,
      ...GlobalInstance,
    };
  }

  return instance;
}
