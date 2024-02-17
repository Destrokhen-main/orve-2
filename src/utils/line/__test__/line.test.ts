import { Line } from "../line";

describe("Line", () => {
  test("default line", () => {
    const a = new Line();
    a.subscribe((next) => {
      expect(next).toBe(1);
    });
    a.next(1);
  });
  test("default line 2 times", () => {
    const a = new Line();
    const mock = jest.fn();
    a.subscribe(mock);
    a.next(1);
    a.next(2);
    expect(mock).toBeCalledTimes(2);
  });

  test("default line complite", () => {
    const a = new Line();
    const mock = jest.fn();
    const unsib = a.subscribe(mock);
    a.next(1);
    unsib();
    a.next(2);
    expect(mock).toBeCalledTimes(1);
  });
});
