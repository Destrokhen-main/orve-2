export function patchListener(
  el: any,
  key: string,
  prevValue: any,
  nextValue: any,
) {
  if (prevValue) {
    el.removeEventListener(key, prevValue);
  }

  el.addEventListener(key, nextValue);
}
