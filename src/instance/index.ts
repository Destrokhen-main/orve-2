import { genUID } from "../helper/";
import { JSX } from "../jsx";
import { CreateApp, OptionsInstance, createApp } from "../parser";
import { NodeOP } from "../parser/parser";
import { cameCase } from "../utils/transformFunctions";

export interface OrveInstance {
  tree: NodeOP | null;
  context: {
    globalComponents?: Record<string, () => unknown>;
    [T: string]: any;
  };
  use: (obj?: unknown) => boolean | OrveInstance;
  component: (nameComponent: string, component: () => unknown) => void;
  createApp: (
    entry: unknown,
    options: OptionsInstance | null,
  ) => CreateApp | null;
}

declare global {
  interface Window {
    Orve: Record<string, OrveInstance>;
    orve: JSX;
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

  const workObject: Record<string, any> = obj;
  const context: OrveInstance = this;

  if (
    workObject.setup !== undefined &&
    typeof workObject.setup === "function"
  ) {
    workObject.setup(context.context);
    return context;
  }

  if (workObject.setup === undefined) {
    context.context["options"] = { ...obj };
    return context;
  }

  return false;
}

/**
 * Регистрация глобального компонента в Instance Orve
 * @param name - string название компонента в camelСase
 * @param component - {function} - Component
 */
function component(name: string, component: () => unknown): void {
  const context = this.context;
  const camelWord = cameCase(name);
  if (context.globalComponents === undefined) {
    context.globalComponents = {};
  }

  if (context.globalComponents[camelWord] === undefined) {
    context.globalComponents[camelWord] = component;
  } else {
    console.warn("[ Component ] - имя данного компонента уже успользуется.");
  }
}

/**
 * Create instance Orve application
 * @returns Orve instance
 */
function orveCreate() {
  if (typeof window === "undefined" && typeof global !== "undefined") {
    global.window = global as any;
  }

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
    component,
    use: use,
    createApp: createApp,
  };

  window.Orve[keyInstance] = instance;

  return instance;
}

export { orveCreate };
