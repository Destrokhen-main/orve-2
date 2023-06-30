import { randInt } from "./random";

const ALL_CHAR = "qwertyuiopasdfghjklzxcvbnm1234567890";

function genUID(len: number): string {
  let key = "";

  while (key.length <= len) {
    key += ALL_CHAR[randInt(0, ALL_CHAR.length - 1)];
  }

  return key;
} 


export { genUID };
