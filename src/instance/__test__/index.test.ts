import { orveCreate } from "../index";

describe("Component", () => {
  test("Создадим orve instance и добавим компонент", () => {
    const app = orveCreate();
    app.component("test", () => {});

    expect(app.context.globalComponents).toBeDefined();
    expect(app.context.globalComponents?.test).toBeDefined();
  });

  test("Плохие данные name", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const app = orveCreate();
    app.component((() => {}) as any, "" as any);

    expect(consoleSpy).toHaveBeenCalledWith(
      "[Global component] - name can be string",
    );
    expect(app.context.globalComponents).not.toBeDefined();
  });

  test("Плохие данные name", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const app = orveCreate();
    app.component("test", "" as any);

    expect(consoleSpy).toHaveBeenCalledWith(
      "[Global component] - component can be function",
    );
    expect(app.context.globalComponents).not.toBeDefined();
  });
});
