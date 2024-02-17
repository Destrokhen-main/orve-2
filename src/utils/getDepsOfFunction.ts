import { updateBuffer } from "./buffer";

function getDeps(func: () => any): [any[], any] {
  const deps: any[] = [];

  updateBuffer(deps);
  const res = func();
  updateBuffer(null);
  return [deps, res];
}

export { getDeps };
