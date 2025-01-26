export function patchImage(el: any, nextValue: any) {
  if (nextValue === null) {
    el.removeAttribute("src");
  } else {
    el.src = nextValue;
  }
}
