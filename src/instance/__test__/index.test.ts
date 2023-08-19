import { orveCreate } from "../index";

describe("Component", () => {
  test("Создадим orve instance и добавим компонент", () => {
    const app = orveCreate();
    app.component("test", () => {});

    console.log(app);
  });
});
