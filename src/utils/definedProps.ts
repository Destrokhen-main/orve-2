import { Node } from "../jsx";

// interface Iprops {
//   default?: () => unknown | string | number | boolean | undefined | null;
//   required: boolean;
// }

type TPropsRequired = {
  required: boolean;
  default?: (() => unknown) | string | number | boolean | undefined | null;
};

type allType = string | number | boolean | Array<unknown> | object;

type TNotRequired = {
  type: allType | allType[] | (() => allType);
};

const checkTypeObject = (
  type: string,
  value: unknown,
  e: string,
  silent = false,
) => {
  const v = type;

  if (typeof v === "object") {
    if (Array.isArray(v)) {
      if (!Array.isArray(value)) {
        if (!silent)
          console.warn(
            `Error type key "${e}" expected "array" but got "${typeof value}"`,
          );
        return false;
      }
    } else {
      if (typeof value !== "object" || Array.isArray(value)) {
        if (!silent) {
          const isArray = Array.isArray(value);
          console.warn(
            `Error type key "${e}" expected "${typeof v}" but got "${
              typeof value !== "object" ? typeof value : isArray ? "array" : ""
            }"`,
          );
        }
        return false;
      }
    }
  } else {
    if (typeof value !== typeof v) {
      if (!silent)
        console.warn(
          `Error type key "${e}" expected "${typeof v}" but got "${typeof value}"`,
        );

      return false;
    }
  }

  return true;
};

type Props = {
  children?: unknown[];
  [T: string]: unknown;
};

// TODO
/*
[ ] - Посмотреть код и переписать по необходимости
[ ] - Проверить как прокидывает контекст
[ ] - Сделать для template отдельное свойство для того, чтобы можно было валидировать template
*/

/**
 * Функция для обозначения props
 * @param Component - {function} - Компонент
 * @param propsType - Объект с настройками props
 * @returns Новый компонент в котором включена прослойка на props.
 */
function definedProps(
  Component: () => unknown,
  propsType: Record<string, TPropsRequired & TNotRequired>,
) {
  return (insertProps: Props) => {
    const propsSettings: Record<string, TPropsRequired & TNotRequired> = {};

    // Обработка найтроек пропсов
    Object.keys(propsType).forEach((e) => {
      const blockPropsSettings = propsType[e];
      if (blockPropsSettings.type !== undefined) {
        if (
          typeof blockPropsSettings.type !== "function" &&
          !Array.isArray(blockPropsSettings.type)
        ) {
          console.warn(
            `Key "${e}" - type must be "String", "Number", "Array", "Object", "Function", "Boolean"`,
          );
          return;
        } else if (Array.isArray(blockPropsSettings.type)) {
          for (let i = 0; i !== blockPropsSettings.type.length; i++) {
            if (typeof blockPropsSettings.type[i] !== "function") {
              console.warn(
                `Key "${e}" - type must be "String", "Number", "Array", "Object", "Function"`,
              );
              return;
            }
          }
        }
        propsSettings[e] = blockPropsSettings;
      } else {
        console.warn(`Key "${e}" - you must specify "type"`);
        return;
      }
    });
    const obj = insertProps;
    if (
      propsSettings !== undefined &&
      Object.keys(propsSettings).length > 0 &&
      insertProps !== undefined
    ) {
      Object.keys(propsSettings).forEach((e) => {
        const prop = propsSettings[e] ?? null;
        const value = obj[e];
        if (prop["required"] === true && value === undefined) {
          console.error(`MISS "${e}" key in props`);
          if (prop.default !== undefined) {
            obj[e] =
              typeof prop["default"] === "function"
                ? prop["default"]()
                : prop["default"];
          } else {
            obj[e] = undefined;
          }
          return;
        } else if (value === undefined) {
          if (prop["default"] !== undefined) {
            if (
              !Array.isArray(prop["type"]) &&
              typeof (prop["type"] as () => unknown)() !== "function"
            ) {
              obj[e] =
                typeof prop["default"] === "function"
                  ? prop["default"]()
                  : prop["default"];
            } else {
              obj[e] = prop["default"];
            }
          } else {
            obj[e] = prop;
          }
          return;
        }

        if (Array.isArray(prop["type"]) && prop["type"].length >= 1) {
          let ch = 0;
          prop["type"].forEach((f: () => any) => {
            const v = f();
            if (checkTypeObject(v, value, e, true)) {
              ch += 1;
            }
          });

          if (ch === 0) {
            const isArray = Array.isArray(value);
            const typper = prop["type"].map((e) => {
              const t = e();

              const type = typeof t;

              if (type !== "object") {
                return type;
              } else {
                if (Array.isArray(t)) return "array";
                else return "object";
              }
            });

            console.warn(
              `Miss type key "${e}" expected "[${typper.join(
                ", ",
              )}]" but got "${
                typeof value !== "object"
                  ? typeof value
                  : isArray
                  ? "array"
                  : ""
              }"`,
            );
            obj[e] =
              prop["default"] ?? typeof prop["default"] === "function"
                ? (
                    prop["default"] as () =>
                      | string
                      | number
                      | boolean
                      | (() => unknown)
                      | null
                      | undefined
                  )()
                : prop["default"];
          }
        } else {
          const v = (prop["type"] as () => unknown)() as string;
          if (!checkTypeObject(v, value, e)) {
            const def = prop["default"] ?? v;
            if (typeof v === "function") {
              obj[e] = def;
            } else {
              obj[e] = typeof def === "function" ? def() : def;
            }
          }
        }
      });
    }
    return Node(Component, obj);
  };
}

export { definedProps };
