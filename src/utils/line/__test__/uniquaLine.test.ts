import { ULine } from "../uniquaLine";

describe("Uniqua Line", () => {
  test("line primitive", () => {
    const line = new ULine();

    const mock = jest.fn();
    line.subscribe(mock);

    line.next(1);
    line.next(1);
    line.next("1");
    line.next("1");
    line.next(null);
    line.next(null);
    line.next(undefined);
    line.next(undefined);

    expect(mock).toBeCalledTimes(4);
  });

  test("line function", () => {
    const line = new ULine();

    const mock = jest.fn();
    line.subscribe(mock);

    line.next(() => { });
    line.next(() => { });
    line.next(() => {
      console.log();
    });

    // TODO что-то не нравится мне это
    expect(mock).toBeCalledTimes(2);
  });

  test("line {}", () => {
    const line = new ULine();

    const mock = jest.fn();
    line.subscribe(mock);

    line.next({ a: 1 });
    line.next({ a: 1 });
    line.next({ x: 1 });

    // TODO что-то не нравится мне это
    expect(mock).toBeCalledTimes(2);
  });

  test("line []", () => {
    const line = new ULine();

    const mock = jest.fn();
    line.subscribe(mock);

    line.next([1]);
    line.next([1]);
    line.next([2]);

    // TODO что-то не нравится мне это
    expect(mock).toBeCalledTimes(2);
  });
});
