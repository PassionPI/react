import { useMemo, useReducer } from "react";

const weak = new WeakMap();

const observer = <T extends object>(init: T, callback: () => void): T => {
  return new Proxy<T>(init, {
    get(...args) {
      const v = Reflect.get(...args);
      if (v && typeof v == "object") {
        if (!weak.has(v)) {
          weak.set(v, observer(v as object, callback));
        }
        return weak.get(v);
      }
      return v;
    },
    set(t, k, v, r) {
      if (Object.is(Reflect.get(t, k, r), v)) {
        return true;
      }
      const x = Reflect.set(t, k, v, r);
      if (x) {
        weak.delete(t);
        callback();
      }
      return x;
    },
  });
};

export const useReactive = <T extends object>(init: () => T): T => {
  const [, update] = useReducer(() => [], []);
  return useMemo(() => observer(init(), update), []);
};
