import { ReactiveType } from "../../reactive/type";
import { TypeNode } from "../type";

export function oForParser(component: any) {
  const props = component.props;

  if (!props.each) {
    console.error("Не указал Each");
    return null;
  }

  if (!component.children[0] || typeof component.children[0] !== "function") {
    console.error("Не указал callback ");
    return null;
  }

  return {
    type: TypeNode.Reactive,
    value: {
      type: ReactiveType.RefArrFor,
      each: props.each,
      callback: component.children[0],
    },
  };
}
