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
        boolean: false,
      });

    const n = definedProps(Component, {
      number: {
        type: Number,
        required: false,
      },
      string: {
        type: String,
        required: false,
      },
      function: {
        type: Function,
        required: false,
      },
      object: {
        type: Object,
        required: false,
      },
      boolean: {
        type: Boolean,
        required: false,
      },
    });

    const component = parserNodeF(n as any, null);
    expect(component?.props).toStrictEqual({
      number: { type: "Static", value: 1 },
      string: { type: "Static", value: "1" },
      function: { type: "Static", value: func },
      object: { type: "Static", value: object },
      boolean: { type: "Static", value: false },
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

  test("Create component with required props", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const Comoponent = function ({ number }: { number: any }) {
      return Node("div", { id: number });
    };

    Comoponent.props = {
      number: {
        type: Number,
        required: true,
        default: 1,
      },
    };

    const component = parserNodeF(Comoponent as any, null);

    expect(consoleSpy).toHaveBeenCalledWith('MISS "number" key in props');
    expect(component?.props).toStrictEqual({
      id: { type: "Static", value: 1 },
    });
  });

  // Создать компонент с пропсом Плохого типа
  // Создать компонент с пропсом типа String и прокинуть в него Number
});
