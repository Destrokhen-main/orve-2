import { NodeOP } from "./parser";
import { oifParsing } from "./reactiveComponentWorker/oIfParsing";

export const REACTIVE_COMPONENT = ["o-if"];

/**
 * Функция помогает распределить реактивные директивы.
 * @param componentO - Component
 * @returns объект после прохождения необходимых работ
 */
function reactiveWorkComponent(componentO: NodeOP) {
  if (componentO.tag === "o-if") {
    return oifParsing(componentO);
  }
  return null;
}

export { reactiveWorkComponent };
