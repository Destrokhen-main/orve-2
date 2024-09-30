import { parserNodeF } from "../parser";
import { Node } from "../../jsx";
import { FRAGMENT } from "../../keys";
import { OrveContext } from "../../instance";

describe("parseNodeF children", () => {
  test("Default component", () => {
    function App() {
      return Node("div", null, "HELLO WORLD");
    }

    const res = parserNodeF.call(
      { __CTX_ID__: true, __SUB__: true } as OrveContext,
      App,
    );
    expect(res).toStrictEqual({
      tag: "div",
      children: [{ type: "Static", value: "HELLO WORLD", node: null }],
      $sub: null,
      nameComponent: "App",
      props: undefined,
      node: null,
      parent: null,
      type: "Component",
    });
  });

  test("Default component in component", () => {
    function component1() {
      return Node("div", null, "HELLO WORLD");
    }

    function component() {
      return Node("div", null, Node(component1, null));
    }

    const res = parserNodeF.call(
      { __CTX_ID__: true, __CTX_PARENT__: true, __SUB__: true } as OrveContext,
      component,
    );
    expect(res).toStrictEqual({
      tag: "div",
      children: [
        {
          tag: "div",
          children: [{ type: "Static", value: "HELLO WORLD", node: null }],
          props: undefined,
          node: null,
          $sub: null,
          parent: null,
          type: "Component",
          nameComponent: "component1",
        },
      ],
      nameComponent: "component",
      props: undefined,
      node: null,
      $sub: null,
      parent: null,
      type: "Component",
    });
  });

  test("Default component in fragment", () => {
    function component1() {
      return Node(FRAGMENT, null, "HELLO WORLD");
    }

    function component() {
      return Node("div", null, Node(component1, null));
    }

    const res = parserNodeF.call(
      { __CTX_ID__: true, __CTX_PARENT__: true, __SUB__: true } as OrveContext,
      component,
    );
    expect(res).toStrictEqual({
      tag: "div",
      children: [
        {
          tag: "Fragment",
          children: [{ type: "Static", value: "HELLO WORLD", node: null }],
          props: undefined,
          node: null,
          parent: null,
          type: "Component",
          $sub: null,
          nameComponent: "component1",
        },
      ],
      nameComponent: "component",
      props: undefined,
      node: null,
      parent: null,
      $sub: null,
      type: "Component",
    });
  });

  test("Default component in recursive", () => {
    function component1() {
      return Node(component2, null);
    }
    function component2() {
      return Node("div", null, "HELLO WORLD");
    }

    function component() {
      return Node("div", null, Node(component1, null));
    }
    const res = parserNodeF.call(
      { __CTX_ID__: true, __CTX_PARENT__: true, __SUB__: true } as OrveContext,
      component,
    );
    expect(res).toStrictEqual({
      tag: "div",
      children: [
        {
          tag: "div",
          children: [{ type: "Static", value: "HELLO WORLD", node: null }],
          props: undefined,
          node: null,
          parent: null,
          type: "Component",
          $sub: null,
          nameComponent: "component1",
        },
      ],
      nameComponent: "component",
      props: undefined,
      node: null,
      parent: null,
      $sub: null,
      type: "Component",
    });
  });

  test("Default component in recursive with impurities", () => {
    function component1() {
      return Node("div", null, Node(component2));
    }
    function component2() {
      return Node("div", null, "HELLO WORLD");
    }

    function component() {
      return Node("div", null, Node(component1, null));
    }
    const res = parserNodeF.call(
      { __CTX_ID__: true, __CTX_PARENT__: true, __SUB__: true } as OrveContext,
      component,
    );
    expect(res).toStrictEqual({
      tag: "div",
      children: [
        {
          tag: "div",
          children: [
            {
              children: [
                {
                  node: null,
                  type: "Static",
                  value: "HELLO WORLD",
                },
              ],
              nameComponent: "component2",
              node: null,
              parent: null,
              props: undefined,
              tag: "div",
              $sub: null,
              type: "Component",
            },
          ],
          props: undefined,
          node: null,
          parent: null,
          type: "Component",
          $sub: null,
          nameComponent: "component1",
        },
      ],
      nameComponent: "component",
      props: undefined,
      node: null,
      parent: null,
      $sub: null,
      type: "Component",
    });
  });

  test("Global Component", () => {
    function globalComp() {
      return Node("div", null, ["HELLO"]);
    }

    function comp() {
      return Node("div", null, Node("global", null));
    }

    const res = parserNodeF.call(
      {
        __CTX_ID__: true,
        __CTX_PARENT__: true,
        globalComponents: { global: globalComp },
        __SUB__: true,
      } as OrveContext,
      comp,
    );
    expect(res).toStrictEqual({
      tag: "div",
      children: [
        {
          tag: "div",
          children: [{ type: "Static", value: "HELLO", node: null }],
          nameComponent: "globalComp",
          props: undefined,
          node: null,
          parent: null,
          $sub: null,
          type: "Component",
        },
      ],
      nameComponent: "comp",
      props: undefined,
      node: null,
      $sub: null,
      parent: null,
      type: "Component",
    });
  });

  test("Global Component props", () => {
    function globalComp(props: any) {
      return Node("div", props, ["HELLO"]);
    }

    function comp() {
      return Node("div", null, Node("global", { id: "1" }));
    }

    const res = parserNodeF.call(
      {
        __CTX_ID__: true,
        __CTX_PARENT__: true,
        globalComponents: { global: globalComp },
        __SUB__: true,
      } as OrveContext,
      comp,
    );
    expect(res).toStrictEqual({
      tag: "div",
      children: [
        {
          tag: "div",
          children: [{ type: "Static", value: "HELLO", node: null }],
          nameComponent: "globalComp",
          props: { id: { type: "Static", value: "1" }, $slot: {} },
          node: null,
          parent: null,
          $sub: null,
          type: "Component",
        },
      ],
      nameComponent: "comp",
      props: undefined,
      node: null,
      parent: null,
      $sub: null,
      type: "Component",
    });
  });
});

describe("parseNodeF props", () => {
  test("Default component with props", () => {
    const fn = jest.fn();

    function App() {
      return Node("div", { id: "1", class: "2", onClick: fn }, "HELLO WORLD");
    }

    const res = parserNodeF.call(
      { __CTX_ID__: true, __SUB__: true } as OrveContext,
      App,
    );
    expect(res).toStrictEqual({
      tag: "div",
      props: {
        id: { type: "Static", value: "1" },
        class: { type: "Static", value: "2" },
        click: { type: "Event", value: fn },
      },
      children: [{ type: "Static", value: "HELLO WORLD", node: null }],
      nameComponent: "App",
      node: null,
      parent: null,
      $sub: null,
      type: "Component",
    });
  });

  test("Two Component with props class", () => {
    function Component2(props: any) {
      return Node("div", props, "HELLO");
    }

    function Component1() {
      return Node("div", null, Node(Component2, { class: "1" }));
    }

    const res = parserNodeF.call(
      { __CTX_ID__: true, __CTX_PARENT__: true, __SUB__: true } as OrveContext,
      Component1,
    );

    expect(res).toStrictEqual({
      tag: "div",
      children: [
        {
          tag: "div",
          props: { $slot: {}, class: { type: "Static", value: "1" } },
          children: [{ type: "Static", value: "HELLO", node: null }],
          node: null,
          parent: null,
          $sub: null,
          type: "Component",
          nameComponent: "Component2",
        },
      ],
      nameComponent: "Component1",
      props: undefined,
      node: null,
      parent: null,
      $sub: null,
      type: "Component",
    });
  });

  test("Two Component with props style", () => {
    function Component2(props: any) {
      return Node("div", props, "HELLO");
    }

    function Component1() {
      return Node(
        "div",
        { style: "font-size: 20px" },
        Node(Component2, { style: { color: "white", fontSize: "20px" } }),
      );
    }

    const res = parserNodeF.call(
      { __CTX_ID__: true, __CTX_PARENT__: true, __SUB__: true } as OrveContext,
      Component1,
    );

    expect(res).toStrictEqual({
      tag: "div",
      children: [
        {
          tag: "div",
          props: {
            $slot: {},
            style: { type: "Static", value: "color:white;font-size:20px;" },
          },
          children: [{ type: "Static", value: "HELLO", node: null }],
          node: null,
          parent: null,
          type: "Component",
          $sub: null,
          nameComponent: "Component2",
        },
      ],
      nameComponent: "Component1",
      props: { style: { type: "Static", value: "font-size: 20px" } },
      node: null,
      $sub: null,
      parent: null,
      type: "Component",
    });
  });

  test("Two Component with props event", () => {
    const func = () => {};

    function Component2(props: any) {
      return Node("div", props, "HELLO");
    }

    function Component1() {
      return Node(
        "div",
        { onclick: func },
        Node(Component2, { class: "1", onClick: func }),
      );
    }

    const res = parserNodeF.call(
      { __CTX_ID__: true, __CTX_PARENT__: true, __SUB__: true } as OrveContext,
      Component1,
    );
    expect(res).toStrictEqual({
      tag: "div",
      children: [
        {
          tag: "div",
          props: {
            $slot: {},
            class: { type: "Static", value: "1" },
            click: { type: "Event", value: func },
          },
          children: [{ type: "Static", value: "HELLO", node: null }],
          node: null,
          parent: null,
          type: "Component",
          $sub: null,
          nameComponent: "Component2",
        },
      ],
      nameComponent: "Component1",
      props: { click: { type: "Event", value: func } },
      node: null,
      parent: null,
      $sub: null,
      type: "Component",
    });
  });
});

describe("parseNodeO", () => {
  test("Default component", () => {
    const fn = () => {};

    const componentA = {
      tag: "div",
      props: {
        oclass: 1,
        id: 1,
        style: "font-size:20px",
        onClick: fn,
        oninput: fn,
      },
      children: ["HELLO"],
    };

    const res = parserNodeF.call(
      { __CTX_ID__: true, __SUB__: true } as OrveContext,
      componentA,
    );
    expect(res).toStrictEqual({
      tag: "div",
      props: {
        id: { type: "Static", value: 1 },
        style: { type: "Static", value: "font-size:20px" },
        class: { type: "Static", value: 1 },
        click: { type: "Event", value: fn },
        input: { type: "Event", value: fn },
      },
      children: [{ type: "Static", value: "HELLO", node: null }],
      node: null,
      $sub: null,
      parent: null,
      type: "Component",
      nameComponent: "Unknown component",
    });
  });

  test("Component in component", () => {
    const fn = () => {};

    const component2 = ({ children, ...props }: { children: any }) => {
      return {
        tag: "div",
        props: props,
        children: children,
      };
    };

    const component1 = {
      tag: "div",
      children: [
        {
          tag: component2,
          props: {
            oclass: 1,
            id: 1,
            style: "font-size:20px",
            onClick: fn,
            oninput: fn,
          },
          children: ["Hello"],
        },
      ],
    };
    const res = parserNodeF.call(
      { __CTX_ID__: true, __CTX_PARENT__: true, __SUB__: true } as OrveContext,
      component1,
      null,
    );
    expect(res).toStrictEqual({
      tag: "div",
      children: [
        {
          tag: "div",
          props: {
            $slot: {},
            id: { type: "Static", value: 1 },
            style: { type: "Static", value: "font-size:20px" },
            class: { type: "Static", value: 1 },
            click: { type: "Event", value: fn },
            input: { type: "Event", value: fn },
          },
          children: [{ type: "Static", value: "Hello", node: null }],
          node: null,
          $sub: null,
          parent: null,
          type: "Component",
          nameComponent: "component2",
        },
      ],
      $sub: null,
      node: null,
      parent: null,
      type: "Component",
      nameComponent: "Unknown component",
      props: undefined,
    });
  });
});
