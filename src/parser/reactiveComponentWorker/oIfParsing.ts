import { FRAGMENT } from "../../keys";
import { ReactiveType } from "../../reactive/type";
import { logger } from "../../utils/logger";
// import { returnNewClone } from "../../utils/returnClone";
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
  if (!props) return null;

  if (props["rule"] === undefined) {
    logger("warn", '%c[o-if]%c: "rule" Не указано');
    return null;
  } else if (typeof props["rule"] !== "function") {
    logger(
      "warn",
      '%c[o-if]%c: Для правильной работы необходимо передавать в "rule" функцию',
    );
  }

  if (props["dep"] !== undefined) {
    const check = (req: any) => {
      if (req.$sub !== undefined) return true;
    };

    const workerDep: any[] = [];
    if (Array.isArray(props["dep"])) {
      props["dep"].forEach((e) => {
        if (check(e)) {
          workerDep.push(e);
        } else {
          logger(
            "warn",
            `%c[o-if]%c: "dep" - ${JSON.stringify(
              e,
            )} - не могу работать с такой зависимостью`,
          );
        }
      });
    } else {
      logger("warn", `%c[o-if]%c: "dep" - need array`);
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
function validationChildren(
  children: Array<any>,
  parent: NodeOP | null = null,
) {
  const parserInstance = parseSingleChildren(parent);

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
            logger("warn", `%c[v-else]%c: We called it another)`);
          }

          ChildNode.else = true;
          isLegal = true;
        } else if (["o-if", "v-if"].includes(key)) {
          if (key.startsWith("v")) {
            logger("warn", `%c[v-if]%c: We called it another)`);
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

  let answerSettings: Record<any, any> = {};
  if (component.children !== undefined) {
    if (
      component.children.length === 1 &&
      component.children[0].tag === undefined
    ) {
      answerSettings = component.children[0];
    } else {
      newChildren = validationChildren(component.children!, component);

      if (newChildren === null) return null;

      newChildren.forEach((e) => {
        if (e.ans !== undefined) {
          answerSettings[e.ans] = e.component;
        } else if (e.else !== undefined) {
          answerSettings.else = e.component;
        }
      });
    }
  }
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
