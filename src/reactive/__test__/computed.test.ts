import { nextTick } from "../../utils/line";
import { computed } from "../computed";
import { ref } from "../ref";

describe("Computed", () => {
  test("init computed and call next", async () => {
    const a = ref(1);
    const b = computed(() => a.value + 1);
    expect(b.value).toBe(2);
    a.value += 1;
    await nextTick();
    expect(b.value).toBe(3);
  });

  test("init computed and call next", async () => {
    const a = ref(1);
    const b = computed(() => a.value + 1);
    expect(b.value).toBe(2);
    a.value += 1;
    await nextTick();
    expect(b.value).toBe(3);
  });

  test("can't set computed", async () => {
    const mock = jest.fn();
    console.warn = mock;
    const a = ref(1);
    const b = computed(() => a.value + 1);
    expect(b.value).toBe(2);
    b.value = 3;
    await nextTick();
    expect(b.value).toBe(2);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  test("check correct update", async () => {
    const a = ref(1);
    const b = ref(3);

    const c = ref(false);

    const d = computed(() => {
      if (c.value) {
        return a.value;
      }
      return b.value;
    });

    const mock = jest.fn();
    d.$sub.subscribe({
      type: 1,
      f: mock,
    });
    expect(d.value).toBe(3);

    a.value = 2;
    await nextTick();
    expect(d.value).toBe(3);

    c.value = true;
    await nextTick();
    expect(d.value).toBe(2);

    b.value = 4;
    await nextTick();
    expect(d.value).toBe(2);

    expect(mock).toHaveBeenCalledTimes(1);
  });

  test("deps set", async () => {
    const a = ref(1);
    const b = ref(2);

    const d = computed(() => a.value + b.value, [a]);

    const mock = jest.fn();
    d.$sub.subscribe({
      type: 1,
      f: mock,
    });
    expect(d.value).toBe(3);

    b.value = 3;
    expect(mock).toHaveBeenCalledTimes(0);

    a.value = 2;
    await nextTick();
    expect(mock).toHaveBeenCalledTimes(1);
    expect(d.value).toBe(5);
  });

  test("computed with multiple dependencies", async () => {
    const a = ref(1);
    const b = ref(2);
    const c = ref(3);

    const d = computed(() => a.value + b.value + c.value, [a, b, c]);

    expect(d.value).toBe(6);

    a.value = 2;
    await nextTick();
    expect(d.value).toBe(7);

    b.value = 3;
    await nextTick();
    expect(d.value).toBe(8);

    c.value = 4;
    await nextTick();
    expect(d.value).toBe(9);
  });

  test("computed with no dependencies", async () => {
    const d = computed(() => 42, []);

    expect(d.value).toBe(42);
  });

  test("computed with nested computed", async () => {
    const a = ref(1);
    const b = computed(() => a.value + 1);
    const c = computed(() => b.value + 1);

    expect(c.value).toBe(3);

    a.value = 2;
    await nextTick();
    expect(c.value).toBe(4);
  });
});
