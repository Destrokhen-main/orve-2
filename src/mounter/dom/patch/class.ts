export function patchClass(el: any, nextValue: any) {
  if (nextValue === null) {
    el.removeAttribute("class");
  } else {
    el.setAttribute("class", nextValue);
  }
}

export function patchSingleClass(el: any, key: string, nextValue: any) {
  if (typeof key === "string" && key.length === 0) {
    return;
  }

  if (nextValue === null) {
    el.classList.remove(key);

    if (el.classList.length === 0) {
      el.removeAttribute("class");
    }
  } else {
    el.classList.add(key);
  }
}
