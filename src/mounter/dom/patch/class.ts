export function patchClass(el: any, nextValue: any) {
  if (nextValue === null) {
    el.removeAttribute("class");
  } else {
    el.setAttribute("class", nextValue);
  }
}

export function patchSingleClass(el: any, key: string, nextValue: any) {
  if (nextValue === null) {
    el.classList.remove(key);
  } else {
    el.classList.add(key);
  }
}
