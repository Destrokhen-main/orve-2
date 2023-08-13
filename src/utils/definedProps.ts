import { Node } from "../jsx";

// interface Iprops {
//   default?: () => any | string | number | boolean | undefined | null;
//   required: boolean;
// }

type TPropsRequired = {
  required: boolean;
  default?: (() => any) | string | number | boolean | undefined | null;
};

type TNotRequired = {
  type: any;
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
  children?: any[];
  [T: string]: any;
};

// TODO
/*
[ ] - Посмотреть код и переписать по необходимости
[ ] - Проверить как прокидывает контекст
[ ] - Сделать для template отдельное свойство для того, чтобы можно было валидировать template
*/
function definedProps(
  node: any,
  pt: Record<string, TPropsRequired & TNotRequired>,
) {
  return (props: Props) => {
    console.log(props, pt);
    const ptype: Record<string, any> = {};

    Object.keys(pt).forEach((e) => {
      const p = pt[e];

      if (p.type !== undefined) {
        if (typeof p.type !== "function" && !Array.isArray(p.type)) {
          console.warn(
            `Key "${e}" - type must be "String", "Number", "Array", "Object", "Function", "Boolean"`,
          );
          return;
        } else if (Array.isArray(p.type)) {
          for (let i = 0; i !== p.type.length; i++) {
            if (typeof p.type[i] !== "function") {
              console.warn(
                `Key "${e}" - type must be "String", "Number", "Array", "Object", "Function"`,
              );
              return;
            }
          }
        }
        if (p.required !== true) {
          if (
            p.required !== undefined &&
            p.required === false &&
            p.default !== undefined
          ) {
            ptype[e] = p;
          } else {
            console.warn(
              `Key "${e}" - if "required" is set to "false" you must specify the default value "default"`,
            );
            return;
          }
        } else {
          ptype[e] = p;
        }
      } else {
        console.warn(`Key "${e}" - you must specify "type"`);
        return;
      }
    });

    const obj = props;
    if (
      ptype !== undefined &&
      Object.keys(ptype).length > 0 &&
      props !== undefined
    ) {
      Object.keys(ptype).forEach((e) => {
        const prop = ptype[e] ?? null;
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
              typeof prop["type"]() !== "function"
            ) {
              obj[e] =
                typeof prop["default"] === "function"
                  ? prop["default"]()
                  : prop["default"];
            } else {
              obj[e] = prop["default"];
            }
          }
          return;
        }

        if (Array.isArray(prop["type"]) && prop["type"].length >= 1) {
          let ch = 0;
          prop["type"].forEach((f) => {
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
                ? prop["default"]()
                : prop["default"];
          }
        } else {
          const v = prop["type"]();
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
    return Node(node, obj);
  };
}

export { definedProps };
