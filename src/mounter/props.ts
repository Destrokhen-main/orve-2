import { Props } from "../jsx-type";
import { TypeProps } from "../parser/type";

export function propsWorker(root: Element | null, props: Props) {
  Object.keys(props).forEach((key) => {
    const item = props[key];

    if (item.type === TypeProps.Static) {
      //
    }
  });
}
