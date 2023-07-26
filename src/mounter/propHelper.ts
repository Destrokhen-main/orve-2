const changerAttributes = (root: HTMLElement, key: string, value: any) => {
  if (key === "value") {
    (root as HTMLInputElement).value = String(value);
  } else {
    root.setAttribute(key, String(value));
  }
};

export { changerAttributes };