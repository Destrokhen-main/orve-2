import { ReactiveType } from "../reactive/type";
import { NodeOP } from "./parser";
import { oifParsing } from "./reactiveComponentWorker/oIfParsing";
import { oForParser } from "./reactiveComponentWorker/oForeParer";

export const REACTIVE_COMPONENT = ["o-if", "o-for"];

/**
 * Функция помогает распределить реактивные директивы.
 * @param componentO - Component
 * @returns объект после прохождения необходимых работ
 */
function reactiveWorkComponent(componentO: NodeOP) {
  if (componentO.tag === ReactiveType.Oif) {
    return oifParsing(componentO);
  }
  if (componentO.tag === ReactiveType.RefArrFor) {
    // валидатор сюда
    return oForParser(componentO);
  }
  return null;
}

export { reactiveWorkComponent };
