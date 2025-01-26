import { checkExistInstance, getInstance } from "./helper";

export enum LifeHook {
  onMounted = "onMounted",
  onBeforeMounted = "onBeforeMounted",
  onCreated = "onCreated",
  onBeforeUnmounted = "onBeforeUnmounted",
  onUnmounted = "onUnmounted",
}

function createLifeHook(nameHook: LifeHook) {
  return function (fn: () => void) {
    checkExistInstance();
    const _currentInstance = getInstance();
    if (_currentInstance) {
      if (_currentInstance[nameHook]) {
        _currentInstance[nameHook].push(fn);
      } else {
        _currentInstance[nameHook] = [fn];
      }
    }
  };
}

export const onMounted = createLifeHook(LifeHook.onMounted);
export const onBeforeMounted = createLifeHook(LifeHook.onBeforeMounted);
export const onCreated = createLifeHook(LifeHook.onCreated);
export const onBeforeUnmounted = createLifeHook(LifeHook.onBeforeUnmounted);
export const onUnmounted = createLifeHook(LifeHook.onUnmounted);

export const AVAILABLE_HOOKS = [
  "onMounted",
  "onBeforeMounted",
  "onCreated",
  "onBeforeUnmounted",
  "onUnmounted",
];
