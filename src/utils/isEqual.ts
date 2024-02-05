// import { ReactiveType } from "../reactive/type";

// const compareObjects = (a: Record<string, any>, b: Record<string, any>) => {
//   if (a === b) return true;

//   if (
//     typeof a !== "object" ||
//     typeof b !== "object" ||
//     a === null ||
//     b === null
//   )
//     return false;

//   const keysA = Object.keys(a),
//     keysB = Object.keys(b);

//   if (keysA.length !== keysB.length) {
//     return false;
//   }

//   if (a.type !== undefined && Object.values(ReactiveType).includes(a.type))
//     return true;

//   for (const key of keysA) {
//     if (key.startsWith("$")) continue;

//     if (!keysB.includes(key)) {
//       return false;
//     }

//     if (typeof a[key] === "function" || typeof b[key] === "function") {
//       if (a[key].toString() !== b[key].toString()) {
//         return false;
//       }
//     } else {
//       if (!compareObjects(a[key], b[key])) {
//         return false;
//       }
//     }
//   }

//   return true;
// };

// const areArraysEqual = (firstArray: any[], secondArray: any[]) => {
//   if (
//     firstArray.length === secondArray.length &&
//     firstArray.every((element, index) => {
//       return isEqual(element, secondArray[index]);
//     })
//   ) {
//     return true;
//   }
//   return false;
// };

// export function isEqual(a: any, b: any): boolean {
//   if (typeof a !== typeof b) return false;

//   if (typeof a === 'function') {
//     return a.toString() === b.toString();
//   }

//   if (
//     (Array.isArray(a) && !Array.isArray(b)) ||
//     (Array.isArray(b) && !Array.isArray(a))
//   )
//     return false;

//   if (Array.isArray(a) && Array.isArray(b)) {
//     if (a.length !== b.length) return false;

//     return areArraysEqual(a, b);
//   }

//   if (typeof a === "object" && typeof b === "object") {
//     return compareObjects(a, b);
//   }
//   if (a !== b) return false;
//   return true;
// }

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore