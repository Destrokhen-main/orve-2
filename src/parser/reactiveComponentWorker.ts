import { NodeOP } from "./parser";
import { oifParsing } from "./reactiveComponentWorker/oIfParsing";

export const REACTIVE_COMPONENT = ["o-if"];

function reactiveWorkComponent(componentO: NodeOP) {
  if (componentO.tag === "o-if") {
    return oifParsing(componentO);
  }
  return null;
}

export { reactiveWorkComponent };
