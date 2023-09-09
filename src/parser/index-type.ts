import { OrveInstance } from "../instance/index-type";
import { NodeOP } from "./parser-type";

export interface OptionsInstance {
  root: boolean;
}

export interface CreateApp {
  mount: (
    root: string | HTMLElement,
    render?: (el: Element, tree: NodeOP) => unknown,
  ) => OrveInstance | false;
}
