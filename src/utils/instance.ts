import { GlobalInstance, isStepCreateApp } from "../instance";

export function generateInstace(parent: any = null) {
  let instance = {
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
    const { context, ...all } = GlobalInstance;
    instance.context = {
      ...instance.context,
      ...context,
    };

    instance = {
      ...instance,
      ...all,
    };
  }

  return instance;
}
