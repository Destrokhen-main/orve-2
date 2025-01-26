import { Props } from "../jsx-type";
import { ComputedImp } from "../reactive/computed";
import { RefImp } from "../reactive/ref";

export function getName(
  component: ((props?: Props) => unknown) | Record<string, unknown>,
): string {
  if (typeof component === "function") {
    return component.name ?? "Unknown Component";
  }

  return (component.nameComponent as string) ?? "Unknown Component";
}

export function returnType(v: unknown): string {
  const type = typeof v;

  if (type === "number") {
    if (Number.isNaN(v)) {
      return "NaN";
    }
    return "number";
  }

  if (type === "object") {
    if (v instanceof RefImp || v instanceof ComputedImp) {
      return "ref";
    }

    if (Array.isArray(v)) {
      return "array";
    }

    if (v === null) {
      return "null";
    }

    return "object";
  }

  return type;
}
