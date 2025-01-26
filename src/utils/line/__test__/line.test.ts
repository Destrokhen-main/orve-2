import { Line, nextTick } from "../line";
import { Call } from "../type";

describe("Line", () => {
  let line: Line;

  beforeEach(() => {
    line = new Line();
  });

  it("should subscribe and unsubscribe a call", () => {
    const call: Call = { type: 1, f: jest.fn() };
    const unsubscribe = line.subscribe(call);

    expect(line.getAllDep().has(call)).toBe(true);

    unsubscribe();
    expect(line.getAllDep().has(call)).toBe(false);
  });

  it("should call subscribed functions with the correct value", async () => {
    const call1: Call = { type: 1, f: jest.fn() };
    const call2: Call = { type: 2, f: jest.fn() };
    line.subscribe(call1);
    line.subscribe(call2);

    line.next("test value");

    await nextTick();

    expect(call1.f).toHaveBeenCalledWith("test value");
    expect(call2.f).toHaveBeenCalledWith("test value");
  });

  it("should not call unsubscribed functions", async () => {
    const call1: Call = { type: 1, f: jest.fn() };
    const call2: Call = { type: 2, f: jest.fn() };
    const unsubscribe1 = line.subscribe(call1);
    line.subscribe(call2);

    unsubscribe1();
    line.next("test value");

    await nextTick();

    expect(call1.f).not.toHaveBeenCalled();
    expect(call2.f).toHaveBeenCalledWith("test value");
  });

  it("should handle multiple calls of the same type", async () => {
    const call1: Call = { type: 1, f: jest.fn() };
    const call2: Call = { type: 1, f: jest.fn() };
    line.subscribe(call1);
    line.subscribe(call2);

    line.next("test value");

    await nextTick();

    expect(call1.f).toHaveBeenCalledWith("test value");
    expect(call2.f).toHaveBeenCalledWith("test value");
  });

  it("should handle no subscribers", async () => {
    line.next("test value");

    await nextTick();

    // No assertions needed, just ensuring no errors are thrown
  });
});
