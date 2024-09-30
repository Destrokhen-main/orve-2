import { Props } from "../jsx-type";

export function getName(
  component: ((props?: Props) => unknown) | Record<string, unknown>,
): string {
  if (typeof component === "function") {
    return component.name ?? "Unknown Component";
  }

  return (component.nameComponent as string) ?? "Unknown Component";
}
