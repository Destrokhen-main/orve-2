import { FRAGMENT } from "../../keys";
import { ReactiveType } from "../../reactive/type";
import { parseSingleChildren } from "../children";
import { NodeOP } from "../parser";
import { TypeNode } from "../type";

/**
 * Проверка верно ли настроенно props
 * @param props - объект настроект для o-if
 * @returns Переработанный объект props
 */
function validationPropsParent(
  props: Record<string, any>,
): Record<string, any> | null {
  if (props["rule"] === undefined) {
    console.warn(
      '%c[o-if]%c: "rule" Не указано',
      `font-weight: bold`,
      `font-weight: normal`,
    );
    return null;
  } else if (typeof props["rule"] !== "function") {
    console.warn(
      '%c[o-if]%c: Для правильной работы необходимо передавать в "rule" функцию',
      `font-weight: bold`,
      `font-weight: normal`,
    );
  }

  if (props["dep"] === undefined) {
    console.warn(
      '%c[o-if]%c: "dep" - Чтобы реактивно следить за изменения в функции. Необходимо передать dep',
      `font-weight: bold`,
      `font-weight: normal`,
    );
  } else {
    const check = (req: any) => {
      if (req.$sub !== undefined) return true;
    };

    const workerDep: any[] = [];
    if (Array.isArray(props["dep"])) {
      props["dep"].forEach((e) => {
        if (check(e)) {
          workerDep.push(e);
        } else {
          console.warn(
            `%c[o-if]%c: "dep" - ${JSON.stringify(
              e,
            )} - не могу работать с такой зависимостью`,
            `font-weight: bold`,
            `font-weight: normal`,
          );
        }
      });
    } else {
      const prop = props["dep"];
      if (
        typeof prop === "object" &&
        prop.type !== undefined &&
        prop.type === ReactiveType.RefO
      ) {
        workerDep.push({
          type: ReactiveType.RefO,
          $sub: props["dep"].proxy.$sub,
          key: props["dep"].key,
        });
      } else if (check(props["dep"])) {
        workerDep.push(props["dep"]);
      } else {
        console.warn(
          `%c[o-if]%c: "dep" - ${JSON.stringify(
            props["dep"],
          )} - не могу работать с такой зависимостью`,
          `font-weight: bold`,
          `font-weight: normal`,
        );
      }
    }

    props.dep = workerDep;
  }

  return props;
}

interface IChildrenOif {
  ans: any;
  fragment?: boolean;
  component: any;
  else?: boolean;
}

// TODO
// [ ] - Необходимо сделать поддержку template вот тут
/**
 * Функция проверяет children o-if
 * @param children - массив children
 * @returns массив обработанных children
 */
function validationChildren(children: Array<any>) {
  const parserInstance = parseSingleChildren.call(null, null);

  if (children.length === 0) return null;

  const newChildren: IChildrenOif[] = [];
  children.forEach((e) => {
    if (e.props !== undefined) {
      const ChildNode = {
        ans: null,
      } as IChildrenOif;

      const parsedProps: Record<string, any> = {};
      let isLegal = false;
      const newNode = { ...e };

      Object.keys(e.props).forEach((key) => {
        if (["o-else", "v-else"].includes(key)) {
          if (key.startsWith("v")) {
            console.warn(
              `%c[v-else]%c: We called it anouther)`,
              `font-weight: bold`,
              `font-weight: normal`,
            );
          }

          ChildNode.else = true;
          isLegal = true;
        } else if (["o-if", "v-if"].includes(key)) {
          if (key.startsWith("v")) {
            console.warn(
              `%c[v-if]%c: We called it anouther)`,
              `font-weight: bold`,
              `font-weight: normal`,
            );
          }

          ChildNode.ans = e.props[key];
          isLegal = true;
        } else if (key === "o-fragment" && typeof e.props[key] === "boolean") {
          ChildNode.fragment = e.props[key];
        } else {
          parsedProps[key] = e.props[key];
        }
      });

      if (isLegal) {
        if (Object.keys(parsedProps).length > 0) {
          newNode.props = parsedProps;
        } else {
          delete newNode.props;
        }

        if (ChildNode.fragment === true) {
          delete newNode.props;
          newNode.tag = FRAGMENT;
        }

        if (ChildNode.else === true) {
          delete ChildNode.ans;
        }

        const comp = parserInstance(newNode);

        ChildNode.component = comp;
        newChildren.push(ChildNode);
      }
    } else {
      return;
    }
  });

  return newChildren;
}

/**
 * Реактианый компонент o-if
 * @param component - Сам реактивный компонент
 * @returns Надстройку для последующуго монтирования.
 */
function oifParsing(component: NodeOP) {
  let newProps = null;
  let newChildren = null;

  if (component.props !== undefined) {
    newProps = validationPropsParent(component.props!);
  }
  if (newProps === null) return null;

  if (component.children !== undefined) {
    newChildren = validationChildren(component.children!);
  }
  if (newChildren === null) return null;
  const answerSettings: Record<any, any> = {};
  newChildren.forEach((e) => {
    if (e.ans !== undefined) {
      answerSettings[e.ans] = e.component;
    } else if (e.else !== undefined) {
      answerSettings.else = e.component;
    }
  });

  return {
    type: TypeNode.Reactive,
    value: {
      type: ReactiveType.Oif,
      answer: answerSettings,
      ...newProps,
    },
  };
}

export { oifParsing };
