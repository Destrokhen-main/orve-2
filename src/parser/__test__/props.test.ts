import { propsWorker } from "../props";
import { ref } from "../../index";

describe.skip("props", () => {
  test("string | boolean | number", () => {
    const res = propsWorker({ id: "1", test: 1, f: true });
    expect(res).toStrictEqual({
      id: { type: "Static", value: "1" },
      test: { type: "Static", value: 1 },
      f: { type: "Static", value: true },
    });
  });

  test("event", () => {
    const fn = () => {};
    const res = propsWorker({ onClick: fn, oninput: fn });

    expect(res).toStrictEqual({
      click: { type: "Event", value: fn },
      input: { type: "Event", value: fn },
    });
  });

  test("style - 1", () => {
    const res = propsWorker({ style: { fontSize: "10px" } });
    expect(res).toStrictEqual({
      style: { type: "Static", value: "font-size:10px;" },
    });
  });
  test("style - 2", () => {
    const res = propsWorker({ style: "font-size: 10px" });
    expect(res).toStrictEqual({
      style: { type: "Static", value: "font-size: 10px" },
    });
  });

  test("ref", () => {
    const a = ref.call({ __CTX_TEST__: true }, 1);
    const res = propsWorker({ id: a });
    expect(res).toStrictEqual({
      id: {
        type: "StaticReactive",
        value: {
          type: "Ref",
          value: 1,
          $sub: {},
        },
      },
    });
  });
});
