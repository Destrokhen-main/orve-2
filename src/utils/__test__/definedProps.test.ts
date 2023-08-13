import { Node } from "../../jsx";
import { parserNodeF } from "../../parser/parser";
import { definedProps } from "../definedProps";

describe("defined props", () => {
  test("Create component with all posible defined props called function", () => {
    const func = () => {};
    const object = {};

    const Component = () =>
      Node("div", {
        number: 1,
        string: "1",
        function: func,
        object,
      });

    const n = definedProps(Component, {
      number: {
        type: Number,
        required: false,
        default: 2,
      },
      string: {
        type: String,
        required: false,
        default: "2",
      },
      function: {
        type: Function,
        required: false,
        default: () => {},
      },
      object: {
        type: Object,
        required: false,
        default: () => ({}),
      },
    });

    const component = parserNodeF(n as any, null);
    expect(component?.props).toStrictEqual({
      number: { type: "Static", value: 1 },
      string: { type: "Static", value: "1" },
      function: { type: "Static", value: func },
      object: { type: "Static", value: object },
    });
  });

  test("Create component with all posible defined props defined in function props", () => {
    const func = () => {};
    const object = {};

    const Component = () =>
      Node("div", {
        number: 1,
        string: "1",
        function: func,
        object,
      });

    Component.props = {
      number: {
        type: Number,
        required: false,
        default: 2,
      },
      string: {
        type: String,
        required: false,
        default: "2",
      },
      function: {
        type: Function,
        required: false,
        default: () => {},
      },
      object: {
        type: Object,
        required: false,
        default: () => ({}),
      },
    };

    const component = parserNodeF(Component as any, null);
    expect(component?.props).toStrictEqual({
      number: { type: "Static", value: 1 },
      string: { type: "Static", value: "1" },
      function: { type: "Static", value: func },
      object: { type: "Static", value: object },
    });
  });

  test.only("Create component with required props", () => {
    const Comoponent = function () {
      return Node("div");
    };

    Comoponent.props = {
      number: {
        type: Number,
        required: true,
        default: 1,
      },
    };

    const component = parserNodeF(Comoponent as any, null);

    expect(component?.props).toStrictEqual({
      number: 1,
    });
    console.log(component);
  });
});
