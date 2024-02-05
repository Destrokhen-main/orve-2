import { cloneDeep } from 'lodash-es';

export function returnNewClone(a: any): any {
  return cloneDeep(a);
  // if (typeof a === "object") {
  //   if (Array.isArray(a)) {
  //     return a.map((e) => returnNewClone(e));
  //   } else if (a !== null) {
  //     const nA: any = {};
  //     Object.keys(a).forEach((key) => {
  //       nA[key] = returnNewClone(a[key]);
  //     });

  //     return nA;
  //   }
  // } else return a;
}
