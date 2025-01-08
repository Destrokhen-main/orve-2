import { cloneDeep } from "lodash-es";

export function returnNewClone(a: any): any {
  return cloneDeep(a);
}
