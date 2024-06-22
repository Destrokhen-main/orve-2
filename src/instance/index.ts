import { JSX } from "../jsx-type";
import { OptionsInstance, createApp } from "../parser";
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
  createApp: (entry: unknown, options?: OptionsInstance | null) => OrveInstance;
  mount: (
    root: string | Element,
    render?: (el: Element, tree: NodeOP) => unknown,
  ) => void;
}

export interface OrveContext {
  __CTX_ID__?: boolean; // Будет выставлять keynode всегда '1'
  __CTX_PARENT__?: boolean; // не подключает parent к компоненту.
  __SUB__?: boolean; // не создаёт Subject
  [x: string]: any;
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
function use(this: OrveInstance, obj: unknown = null) {
  if (obj === null) {
    console.warn("obj is null");
    return this;
  }

  if (typeof obj !== "object" && obj !== null) {
    console.warn("Insert item not a object");
    return this;
  }

  const workObject: Record<string, any> = obj;

  if (
    workObject.setup !== undefined &&
    typeof workObject.setup === "function"
  ) {
    workObject.setup(this.context);
    return this;
  }

  if (workObject.setup === undefined) {
    this.context["options"] = { ...obj };
    return this;
  }

  return this;
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

  // if (window.Orve === undefined) {
  //   window.Orve = {};
  // }

  const instance: OrveInstance = {
    tree: null,
    context: {},
    component,
    use: use,
    createApp,
    mount: () => {
      console.warn("Приложение похоже не собралось");
    },
  };

  return instance;
}

export { orveCreate };
