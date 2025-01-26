import { Props } from "../jsx-type";
import { TypeProps } from "../parser/type";
import { returnType } from "../utils";
import { patchProps } from "./dom";
import { patchSingleClass } from "./dom/patch/class";
import { patchListener } from "./dom/patch/listener";
import { patchSingleStyle } from "./dom/patch/style";

function styleProps(root: Element | null, item: any) {
  if (returnType(item) === "ref") {
    const value = item.value;
    patchProps(root, "style", null, value);

    item.$sub.subscribe({
      type: 1,
      f: (newValue: any) => {
        patchProps(root, "style", null, newValue);
      },
    });
  } else {
    Object.keys(item).forEach((key) => {
      const it = item[key];
      if (returnType(it) === "ref") {
        patchSingleStyle(root, key, it.value);

        it.$sub.subscribe({
          type: 1,
          f: (newValue: any) => {
            patchSingleStyle(root, key, newValue);
          },
        });
      } else {
        patchSingleStyle(root, key, it);
      }
    });
  }
}

// computed => ['', { cl: boolean }] | { cl: boolean} | ""

function prevExistClasses(prevArray: any, prev: any) {
  Object.keys(prev).forEach((k) => {
    if (prev[k]) {
      prevArray[k] = 1;
    }
  });
}

function returnClassesLine(val: any) {
  const prevArray: any = {};

  if (typeof val === "string") {
    val.split(" ").forEach((x) => {
      prevArray[x] = 1;
    });
  }

  if (returnType(val) === "object") {
    prevExistClasses(prevArray, val);
  }

  if (returnType(val) === "array") {
    val.forEach((k: any) => {
      if (typeof k === "string") {
        prevArray[k] = 1;
      }
      if (returnType(k) === "object") {
        prevExistClasses(prevArray, k);
      }
    });
  }

  return prevArray;
}

function analyzeClasses(prev: any, next: any) {
  const prevValues = returnClassesLine(prev);
  const nextValues = returnClassesLine(next);

  const total: any = [];

  Object.keys(nextValues).forEach((key) => {
    if (!prevValues[key]) {
      total.push({
        key,
        type: "add",
      });
      return;
    }

    if (prevValues[key]) {
      prevValues[key] = 0;
      nextValues[key] = 0;
    }
  });

  Object.keys(prevValues).forEach((key) => {
    if (prevValues[key] === 1) {
      total.push({
        key,
        type: "remove",
      });
    }
  });

  return total;
}

function classProps(root: Element | null, item: any) {
  if (returnType(item) === "ref") {
    const value = item.value;
    classProps(root, value);
    let prev = value;
    item.$sub.subscribe({
      type: 1,
      f: (newValue: any) => {
        const item = analyzeClasses(prev, newValue);
        item.forEach((e: any) => {
          if (e.type === "add") {
            patchSingleClass(root, e.key, true);
          }
          if (e.type === "remove") {
            patchSingleClass(root, e.key, null);
          }
        });
        prev = newValue;
      },
    });
    return;
  }

  if (Array.isArray(item)) {
    item.forEach((e) => {
      if (returnType(e) === "ref") {
        const value = e.value;

        patchSingleClass(root, value, value);
        let prev = value;
        e.$sub.subscribe({
          type: 1,
          f: (newValue: any) => {
            patchSingleClass(root, prev, null);
            patchSingleClass(root, newValue, newValue);
            prev = newValue;
          },
        });
        return;
      }
      if (typeof e === "object") {
        classProps(root, e);
      }
      if (typeof e === "string") {
        patchSingleClass(root, e, e);
      }
    });
    return;
  }

  if (typeof item === "object") {
    Object.keys(item).forEach((key) => {
      const isActive = item[key];
      if (returnType(isActive) === "ref") {
        const value = isActive.value;
        patchSingleClass(root, key, value);

        isActive.$sub.subscribe({
          type: 1,
          f: (newValue: any) => {
            patchSingleClass(root, key, newValue);
          },
        });
      } else {
        patchSingleClass(root, key, !item[key] ? null : true);
      }
    });
  }
}

function srcProps(root: Element | null, item: any) {
  const value = item.value;

  patchProps(root, "src", null, value);

  item.$sub.subscribe({
    type: 1,
    f: (newValue: any) => {
      if (typeof newValue === "object" && newValue.default !== undefined) {
        patchProps(root, "src", null, newValue.default);
      } else {
        patchProps(root, "src", null, newValue);
      }
    },
  });
}

function anotherProps(root: Element | null, key: string, item: any) {
  if (root) {
    patchProps(root, key, null, item.value);

    item.$sub.subscribe({
      type: 1,
      f: (newValue: any) => {
        patchProps(root, key, null, newValue);
      },
    });
  }
}

function eventProps(root: Element | null, key: string, item: any) {
  if (typeof item === "function") {
    patchListener(root, key, null, item);
    return;
  }
  if (returnType(item) === "ref") {
    const value = item.value;

    if (typeof value === "function") {
      patchListener(root, key, null, value);
    }

    let prev = value;
    item.$sub.subscribe({
      type: 1,
      f: (newValue: any) => {
        if (typeof newValue === "function") {
          patchListener(root, key, prev, newValue);
          prev = newValue;
        } else {
          patchListener(root, key, prev, null);
        }
      },
    });
  }
}

function reactivePropsWorker(root: Element | null, key: string, item: any) {
  if (key === "style") {
    return styleProps(root, item);
  }

  if (key === "class") {
    return classProps(root, item);
  }

  if (key === "src") {
    return srcProps(root, item);
  }

  anotherProps(root, key, item);
}

/**
 * Функция для обработки props
 * @param root - Корневой элемент
 * @param props - Принимаемые props
 */
export function propsWorker(root: Element | null, props: Props) {
  Object.keys(props).forEach((key) => {
    const item = props[key];

    if (item.type === TypeProps.Static) {
      if (key === "class" && Array.isArray(item.value)) {
        patchProps(root, key, null, item.value.join(" "));
      } else {
        patchProps(root, key, null, item.value);
      }
    }

    if (item.type === TypeProps.Reactive) {
      reactivePropsWorker(root, key, item.value);
    }

    if (item.type === TypeProps.Event) {
      eventProps(root, key, item.value);
    }
  });
}
