import { FRAGMENT } from "../../keys";
import { ReactiveType } from "../../reactive/type";
import { parseSingleChildren } from "../children";
import { NodeOP } from "../parser";
import { TypeNode } from "../type";

function validationPropsParent(props: Record<string, any>): Record<string, any> | null {
  if (props['rules'] === undefined) {
    console.warn(`o-if: "rules" Не указано`);
    return null
  } else if (typeof props['rules'] !== "function") {
    console.warn(`o-if: Для правильной работы необходимо передавать в "rules" функцию`)
  }

  if (props['dep'] === undefined) {
    console.warn(`o-if: "dep" - Чтобы реактивно следить за изменения в функции. Необходимо передать dep`);
  } else {
    const check = (req: any) => {
      if (req.$sub !== undefined) return true;
    }

    const workerDep: any[] = [];
    if (Array.isArray(props['dep'])) {
      props['dep'].forEach((e) => {
        if (check(e)) {
          workerDep.push(e);
        } else {
          console.warn(`o-if: "dep" - ${JSON.stringify(e)} - не могу работать с такой зависимостью`)
        }
      })
    } else {
      if (check(props['dep'])) {
        workerDep.push(props['dep']);
      } else {
        console.warn(`o-if: "dep" - ${JSON.stringify(props['dep'])} - не могу работать с такой зависимостью`)
      }
    }

    props.dep = workerDep;
  }

  return props;
}

interface IChildrenOif {
  ans: any,
  fragment?: boolean, 
  component: any,
  else?: boolean
}

function validationChildren(children: Array<any>) {
  const parserInstance = parseSingleChildren.call(null, null);

  if (children.length === 0) return null
  
  const newChildren : IChildrenOif[] = [];
  children.forEach((e) => {
    if (e.props !== undefined) {
      const ChildNode  = {
        ans: null
      } as IChildrenOif;

      const parsedProps: Record<string, any> = {};
      let isLegal = false;
      const newNode = { ...e }; 

      Object.keys(e.props).forEach((key) => {
        if (key === "o-else") {
          ChildNode.else = true;
          isLegal = true;
        } else if (key === "o-if") {
          ChildNode.ans = e.props[key];
          isLegal = true;
        } else if (key === "o-fragment" && typeof e.props[key] === "boolean") {
          ChildNode.fragment = e.props[key];
        } else {
          parsedProps[key] = e.props[key];
        }
      })

      if (isLegal) {
        if (Object.keys(parsedProps).length > 0) {
          newNode.props = parsedProps;
        } else {
          delete newNode.props;
        }

        if (ChildNode.fragment === true) {
          delete newNode.props;
          newNode.tag = FRAGMENT
        }

        if (ChildNode.else === true) {
          delete ChildNode.ans;
        }
        
        const comp = parserInstance(newNode);

        ChildNode.component = comp;
        newChildren.push(ChildNode)
      }
    } else {
      return;
    }
  })

  return newChildren;
}

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
  if (newChildren === null) return null
  const answerSettings: Record<any, any> = {};
  newChildren.forEach((e) => {
    if (e.ans !== undefined) {
      answerSettings[e.ans] = e.component;
    } else if (e.else !== undefined) {
      answerSettings.else = e.component;
    }
  })

  return {
    type: TypeNode.Reactive,
    value: {
      type: ReactiveType.Oif,
      answer: answerSettings,
      ...newProps
    }
  };
}

export { oifParsing }