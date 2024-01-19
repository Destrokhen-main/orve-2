export function returnNewClone(a: any) {
  if (typeof a === "object") {
    if (Array.isArray(a)) {
      return [...a];
    } else if (a !== null) {
      return { ...a };
    }
  } else return a;
}
