import { buffer, updateBuffer } from "./buffer";

// [ ] - в буффере может быть одинаковые deps;
function getDeps(func: () => any): [any[], any] {
  const deps: any[] = [];

  let end = null;
  if (buffer) {
    end = buffer;
  }

  updateBuffer(deps);
  const res = func();
  updateBuffer(end);

  const _deps = new Set(deps);

  return [Array.from(_deps), res];
}

export { getDeps };
