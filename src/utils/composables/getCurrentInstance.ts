// import { currentInstance } from "../../parser/parser";
import { checkExistInstance, getInstance } from "./helper";

export function getCurrentInstance() {
  checkExistInstance();
  return getInstance();
}

export function getContext() {
  checkExistInstance();
  const instance = getInstance();
  return instance.context;
}

export function getCurrentElement() {
  checkExistInstance();
  const instance = getInstance();
  return instance.el;
}
