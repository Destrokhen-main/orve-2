import { currentInstance } from "../../parser/parser";
import { checkExistInstance, getInstance } from "./helper";

export function getCurrentInstance() {
  checkExistInstance();
  return getInstance();
}
