import { orveCreate } from "../../instance";
import { Node } from "../../jsx";

function AppCorrect() {
  return Node("div", null, "hello world");
}

function AppIncorrect() {
  throw new Error("test");
}

describe("createApp", () => {
  test("correct entry", () => {
    const app = orveCreate();
    const application = app.createApp(AppCorrect);
    expect(application).not.toBeNull();
  });
  test("incorrect entry", () => {
    const app = orveCreate();
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const application = app.createApp(AppIncorrect);
    expect(consoleSpy).toBeCalledWith(
      "[AppIncorrect()] Component don't be build",
    );
    expect(consoleError).toBeCalledWith(
      "[AppIncorrect()] - [Parser error]: Error: test",
    );
    expect(application).not.toBeNull();
  });
});
