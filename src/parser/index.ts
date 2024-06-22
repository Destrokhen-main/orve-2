import { OrveInstance } from "../instance";
import { Node, Fragment } from "../jsx";
import { NodeOP, parserNodeF } from "./parser";
// import { mounterNode } from "../mounter";
import { mounter } from "../mounter_n";
import { InvokeAllNodeHook } from "../helper/hookHelper";

export interface OptionsInstance {
  root: boolean;
}

export interface CreateApp {
  mount: (
    root: string | HTMLElement,
    render?: (el: Element, tree: NodeOP) => unknown,
  ) => OrveInstance | false;
}

function isValidEntry(entry: unknown): boolean {
  const typeEntry = typeof entry;

  if (typeEntry !== "function") {
    return false;
  }

  return true;
}

/**
 * Обрабатывает массив настроек для функции createApp
 * @param options - объект с настройками
 */
function optionsInstance(options: OptionsInstance) {
  if (options.root !== undefined && options.root === true) {
    if (window.orve !== undefined) {
      window.orve["Node"] = Node;
      window.orve["Fragment"] = Fragment;
    } else {
      window.orve = {
        Node,
        Fragment,
      };
    }
  }
}

/**
 * Create App orve
 * @param entry - Component Orve
 * @param options - Object settings { root: boolean }
 * @returns
 */
function createApp(
  this: OrveInstance,
  entry: unknown = null,
  options: OptionsInstance | null = null,
): OrveInstance {
  if (options !== null) {
    optionsInstance(options);
  }

  if (!isValidEntry(entry)) {
    console.warn("Entry not a function");
    return this;
  }

  const allContext = this;

  const workFunction = entry as () => unknown;
  allContext.tree = parserNodeF.call(allContext.context, workFunction);

  if (allContext.tree !== null && window !== undefined) {
    const beforeUnmounted = function () {
      if (allContext.tree) {
        InvokeAllNodeHook(allContext.tree, "beforeUnmount");
      }
    };

    const unmounted = function () {
      if (allContext.tree) {
        InvokeAllNodeHook(allContext.tree, "unmounted");
      }
    };

    if (
      typeof window !== "undefined" &&
      window.addEventListener !== undefined
    ) {
      window?.addEventListener("beforeunload", beforeUnmounted);

      //window.onbeforeunload = beforeUnmounter;

      window?.addEventListener("unload", unmounted);

      //window.onunload = unmounter;
    }
  }

  allContext.mount = (
    root: string | Element,
    render?: (el: Element, tree: NodeOP) => unknown,
  ) => {
    let rootElement: Element | null = null;
    if (typeof root === "string") {
      const item = document.querySelector(root);
      if (item === null) {
        console.warn(`"${root}" not founted`);
        return false;
      }
      rootElement = item;
    } else if (typeof root === "object" && root.nodeType === 1) {
      rootElement = root;
    }
    if (rootElement === null) {
      console.warn(" root is null ");
      return false;
    }
    if (allContext.tree !== null) {
      allContext.tree =
        render !== undefined
          ? render(rootElement, allContext.tree)
          : mounter(rootElement, allContext.tree);
    }
  };
  return allContext;
}

export { createApp };
