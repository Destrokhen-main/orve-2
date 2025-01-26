import { getValueAtPath } from "../refHelper";

describe("getValueAtPath", () => {
  it("should return the value at the given path", () => {
    const obj = { a: { b: { c: 42 } } };
    const path = "a.b.c";
    const result = getValueAtPath(obj, path);
    expect(result).toBe(42);
  });

  it("should return undefined for non-existing path", () => {
    const obj = { a: { b: { c: 42 } } };
    const path = "a.b.d";
    const result = getValueAtPath(obj, path);
    expect(result).toBeUndefined();
  });

  it("should return undefined for empty path", () => {
    const obj = { a: { b: { c: 42 } } };
    const path = "";
    const result = getValueAtPath(obj, path);
    expect(result).toBeUndefined();
  });

  it("should return the value for a single level path", () => {
    const obj = { a: 42 };
    const path = "a";
    const result = getValueAtPath(obj, path);
    expect(result).toBe(42);
  });

  it("should return undefined if the path is not a string", () => {
    const obj = { a: { b: { c: 42 } } };
    const path = null;
    const result = getValueAtPath(obj, path);
    expect(result).toBeUndefined();
  });

  it("should return undefined if is not an object", () => {
    const obj = 42;
    const path = "b.c";
    expect(getValueAtPath(obj as any, path)).toBeUndefined();
  });

  it("should return undefined if the obj is null", () => {
    const obj = null;
    const path = "b.c";
    expect(getValueAtPath(obj as any, path)).toBeUndefined();
  });
});
