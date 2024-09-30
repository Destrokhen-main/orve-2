import { currentInstance } from "../../parser/parser";
import { GlobalInstance, isStepCreateApp } from "../../instance";

export function checkExistInstance() {
  if (!getInstance()) {
    console.warn(
      "Возможно вы пытаетесь получить инстанс не в компоненте или не в вверху компонента",
    );
  }
}

export function getInstance() {
  return isStepCreateApp ? currentInstance : GlobalInstance;
}