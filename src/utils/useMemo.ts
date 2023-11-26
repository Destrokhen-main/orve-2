import { genUID } from "../helper/generation";

const cash = new Map();

export function useMemo(reactiveObject: any) {
  if (reactiveObject._localCash !== undefined) {
    const addressCash = cash.get(reactiveObject._localCash);
    reactiveObject.value = addressCash;
    return reactiveObject;
  }

  if (reactiveObject.$sub === undefined) {
    return reactiveObject;
  }

  if (!["string", "number", "boolean"].includes(typeof reactiveObject.value))
    return reactiveObject;

  const uid = genUID(8);
  cash.set(uid, reactiveObject.value);

  reactiveObject.$sub.subscribe((n: any) => {
    cash.set(uid, n);
  });

  return reactiveObject;
}
