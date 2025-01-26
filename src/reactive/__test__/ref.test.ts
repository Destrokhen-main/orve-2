import { nextTick } from "../../utils/line";
import { ref, RefImp } from "../ref";
import { ReactiveType } from "../type";

describe("Ref", () => {
  test("init", () => {
    const a = ref(1);
    expect(a instanceof RefImp).toBe(true);
  });
  test("init for test (disabled sub)", () => {
    const a = ref(1, { __CTX_TEST__: true });
    expect(a.$sub).toBe(null);
  });
  test("init primitive", async () => {
    const a = ref(1);
    const mock = jest.fn();

    a.$sub?.subscribe({
      type: 1,
      f: mock,
    });
    a.value = 2;
    await nextTick();
    expect(mock).toHaveBeenCalledWith(2);
  });
  test("init array", async () => {
    const a = ref([1, 2, 3]);
    const mock = jest.fn();

    a.$sub?.subscribe({
      type: 1,
      f: mock,
    });
    a.value.push(4);
    await nextTick();
    expect(mock).toHaveBeenCalledWith([1, 2, 3, 4]);
  });
  test("init object", async () => {
    const a = ref<{ a: number; b?: number }>({ a: 1 });
    const mock = jest.fn();

    a.$sub?.subscribe({
      type: 1,
      f: mock,
    });
    a.value.a = 2;
    await nextTick();
    expect(mock).toHaveBeenCalledWith({ a: 2 });
    a.value.b = 1;
    await nextTick();
    expect(mock).toHaveBeenCalledWith({ a: 2, b: 1 });
  });
  test("change type primitive (num) -> primitive (str)", async () => {
    const a = ref<number | string>(1);
    const mock = jest.fn();

    a.$sub?.subscribe({
      type: 1,
      f: mock,
    });
    expect(a.value).toBe(1);
    a.value = "2";
    await nextTick();
    expect(mock).toHaveBeenCalledWith("2");
  });
  test("change type primitive (num) -> array", async () => {
    const a = ref<number | number[]>(1);
    const mock = jest.fn();

    a.$sub?.subscribe({
      type: 1,
      f: mock,
    });
    expect(a.value).toBe(1);
    a.value = [1, 2, 3];
    await nextTick();
    expect(mock).toHaveBeenCalledWith([1, 2, 3]);

    a.value.push(4);
    await nextTick();
    expect(mock).toHaveBeenCalledWith([1, 2, 3, 4]);
  });
  test("change type primitive (num) -> object", async () => {
    const a = ref<number | { a: number }>(1);
    const mock = jest.fn();

    a.$sub?.subscribe({
      type: 1,
      f: mock,
    });
    expect(a.value).toBe(1);
    a.value = { a: 1 };
    await nextTick();
    expect(mock).toHaveBeenCalledWith({ a: 1 });

    a.value.a = 2;
    await nextTick();
    expect(mock).toHaveBeenCalledWith({ a: 2 });
  });
  test("change type array -> primitive (num)", async () => {
    const a = ref<number | number[]>([1, 2, 3]);
    const mock = jest.fn();

    a.$sub?.subscribe({
      type: 1,
      f: mock,
    });
    expect(a.value).toEqual([1, 2, 3]);
    a.value = 1;
    await nextTick();
    expect(mock).toHaveBeenCalledWith(1);
  });
  test("change type array -> object", async () => {
    const a = ref<number[] | { a: number }>([1, 2, 3]);
    const mock = jest.fn();

    a.$sub?.subscribe({
      type: 1,
      f: mock,
    });
    expect(a.value).toEqual([1, 2, 3]);
    a.value = { a: 1 };
    await nextTick();
    expect(mock).toHaveBeenCalledWith({ a: 1 });

    a.value.a = 2;
    await nextTick();
    expect(mock).toHaveBeenCalledWith({ a: 2 });
  });
  test("change type object -> primitive (num)", async () => {
    const a = ref<{ a: number } | number>({ a: 1 });
    const mock = jest.fn();

    a.$sub?.subscribe({
      type: 1,
      f: mock,
    });
    expect(a.value).toEqual({ a: 1 });
    a.value = 1;
    await nextTick();
    expect(mock).toHaveBeenCalledWith(1);
  });
  test("change type arrray -> to undefined", async () => {
    const a = ref<number[]>([1, 2, 3]);
    const mock = jest.fn();

    a.$sub?.subscribe({
      type: 1,
      f: mock,
    });
    expect(a.value).toEqual([1, 2, 3]);
    a.value = undefined as any;
    await nextTick();
    expect(mock).toHaveBeenCalledWith(undefined);
  });
  test("change type object -> array", async () => {
    const a = ref<any>([{ a: 1 }]);
    const mock = jest.fn();

    a.$sub?.subscribe({
      type: 1,
      f: mock,
    });
    expect(a.value).toEqual([{ a: 1 }]);
    a.value = [1, 2, 3];
    await nextTick();
    expect(mock).toHaveBeenCalledWith([1, 2, 3]);
  });
  test("change array [index]", async () => {
    const a = ref<number[]>([1, 2, 3]);
    const mock = jest.fn();

    a.$sub?.subscribe({
      type: 1,
      f: mock,
    });
    a.value[0] = 2;
    await nextTick();
    expect(mock).toHaveBeenCalledWith([2, 2, 3]);
  });
  test("deep array of objects", async () => {
    const a = ref<{ a: number }[]>([{ a: 1 }, { a: 2 }]);
    const mock = jest.fn();

    a.$sub?.subscribe({
      type: 1,
      f: mock,
    });
    a.value[0].a = 2;
    await nextTick();
    expect(mock).toHaveBeenCalledWith([{ a: 2 }, { a: 2 }]);
  });
  test("nested object", async () => {
    const a = ref<{ a: { b: number } }>({ a: { b: 1 } });
    const mock = jest.fn();

    a.$sub?.subscribe({
      type: 1,
      f: mock,
    });
    a.value.a.b = 2;
    await nextTick();
    expect(mock).toHaveBeenCalledWith({ a: { b: 2 } });
  });
  test("array of nested objects", async () => {
    const a = ref<{ a: { b: number } }[]>([{ a: { b: 1 } }, { a: { b: 2 } }]);
    const mock = jest.fn();

    a.$sub?.subscribe({
      type: 1,
      f: mock,
    });
    a.value[1].a.b = 3;
    await nextTick();
    expect(mock).toHaveBeenCalledWith([{ a: { b: 1 } }, { a: { b: 3 } }]);
  });
  test("object return obj or value", async () => {
    const a = ref({ a: 1, b: { a: 1 } });

    expect(a.value.a).toBe(1);

    expect(a.draw("a")).toStrictEqual({
      type: ReactiveType.RefO,
      keyPath: "a",
      parent: a,
    });
    expect(a.draw("b.a")).toStrictEqual({
      type: ReactiveType.RefO,
      keyPath: "b.a",
      parent: a,
    });
  });
});
