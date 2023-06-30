import { NodeHooks } from "../jsx";
import { NodeOP } from "../parser/parser";

export function InvokeHook(obj: NodeOP, nameHook: string | keyof NodeHooks, value: any = null): boolean {
  if (obj.hooks === undefined) { 
    return false;
  }
  
  const h = obj.hooks;
  if (Object.keys(h).includes(nameHook)) {
    try {
      h[nameHook as keyof NodeHooks]({});
      return true;
    } catch (er) {
      return false;
    }
  }

  return false;
}

export function InvokeAllNodeHook(obj: NodeOP, hook: keyof NodeHooks): void {
  let quee = [ obj ];

  while (quee.length > 0) {
    const item = quee.shift();

    if (item !== undefined && item.hooks !== undefined && item.hooks[hook] !== undefined) {
      item.hooks[hook]({});

      if (item.children !== undefined && item.children.length > 0) {
        quee = [ ...quee, ...item.children];
      }
    }
  }
}