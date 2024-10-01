import { GlobalInstance, isStepCreateApp } from "../instance";

export function generateInstace(parent: any = null) {
  let instance = {
    el: null,
    context: {},
    parent: null,
  };

  if (parent) {
    instance.parent = parent.context;
    if (
      parent.context.context &&
      Object.keys(parent.context.context).length > 0
    ) {
      instance.context = { ...instance.context, ...parent.context.context };
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
