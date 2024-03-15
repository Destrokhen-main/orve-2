import { parseChildren } from "../children";
import { Node } from "../../jsx";

describe("парсинг children", () => {
  test("Статика", () => {
    const ArrayChildren = ["string", 1000, true];

    const parsedArray = parseChildren.call({}, ArrayChildren, null);

    expect(parsedArray).toStrictEqual([
      { type: "Static", value: "string", node: null },
      { type: "Static", value: 1000, node: null },
      { type: "Static", value: true, node: null },
    ]);
  });

  test("HTML", () => {
    const array = ["<div>TEST</div>"];

    const parsedArray = parseChildren.call({}, array, null);

    expect(parsedArray).toStrictEqual([
      { type: "HTML", value: "<div>TEST</div>", node: null },
    ]);
  });

  test("div node", () => {
    const array = [Node("div", null, "HELLO WORLD")];

    const parsedArray = parseChildren.call(
      { __CTX_ID__: true, __CTX_PARENT__: true, __SUB__: true },
      array,
      null,
    );

    expect(parsedArray).toStrictEqual([
      {
        tag: "div",
        children: [{ type: "Static", value: "HELLO WORLD", node: null }],
        props: undefined,
        node: null,
        parent: null,
        $sub: null,
        type: "Component",
        nameC: "Unknown component",
      },
    ]);
  });

  test("Component", () => {
    const Component = function () {
      return Node("div", null, ["HELLO WORLD"]);
    };

    const array = [Node(Component, null)];

    const parsedArray = parseChildren.call(
      { __CTX_ID__: true, __CTX_PARENT__: true, __SUB__: true },
      array,
      null,
    );

    expect(parsedArray).toStrictEqual([
      {
        tag: "div",
        children: [{ type: "Static", value: "HELLO WORLD", node: null }],
        props: undefined,
        node: null,
        $sub: null,
        parent: null,
        type: "Component",
        nameC: "Component",
      },
    ]);
  });
});
