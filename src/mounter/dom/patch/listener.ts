export function patchListener(
  el: any,
  key: string,
  prevValue: any,
  nextValue: any,
) {
  if (prevValue) {
    el.removeEventListener(key, prevValue);
  }

  if (nextValue !== null) el.addEventListener(key, nextValue);
}
