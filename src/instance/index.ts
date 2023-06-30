import { genUID } from "../helper/";
import { JSX } from "../jsx";
import { CreateApp, OptionsInstance, createApp } from "../parser";
import { NodeOP } from "../parser/parser";

export interface OrveInstance {
  tree: NodeOP | null, // TODO поменять тип
  context: Record<string, any>, // TODO поменять тип
  use: (obj?: unknown) => boolean | OrveInstance,
  createApp: (entry: unknown, options: OptionsInstance | null) => CreateApp | null, // TODO поменять тип
}

declare global {
  interface Window {
    Orve: Record<string, OrveInstance>,
    orve: JSX
  }
}

/**
 * Integration Plugin in Orve application
 * @param obj - object plugin
 * @returns false if has any errors or return Orve Instance
 */
function use(obj: unknown = null) {
  if (obj === null) {
    console.warn("obj is null");
    return false; 
  }

  if (typeof obj !== "object" && obj !== null) {
    console.warn("Insert item not a object");
    return false;
  }

  const workObject : Record<string, any> = obj;
  const context: OrveInstance = this;

  if (workObject.setup !== undefined && typeof workObject.setup === "function") {
    workObject.setup(context.context);
    return context;
  }

  if (workObject.setup === undefined) {
    context.context["options"] = { ...obj }
    return context;
  }

  return false;
}

/**
 * Create instance Orve application
 * @returns Orve instance
 */
function orveCreate() {
  if (window.Orve === undefined) {
    window.Orve = {};
  }

  let keyInstance = genUID(8);

  if (window.Orve[keyInstance] !== undefined) {
    keyInstance = genUID(9);
  }

  const instance: OrveInstance = {
    tree: null,
    context: {},
    use: use,
    createApp: createApp
  }

  window.Orve[keyInstance] = instance;

  return instance;
}

export { orveCreate };